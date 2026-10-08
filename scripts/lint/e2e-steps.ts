import type { Rule } from "eslint";
import ts from "typescript";
import { repoPath } from "./source-shape.ts";

export const CTX_THROWING_WAITS: readonly string[] = ["waitSettled", "waitTurned", "settle"];

type Services = { program: ts.Program; esTreeNodeToTSNodeMap: { get(node: unknown): ts.Node } };

const isFunctionLike = (n: ts.Node): n is ts.FunctionLikeDeclaration =>
  ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

const isStepBody = (n: ts.Node): boolean =>
  (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) &&
  ts.isCallExpression(n.parent) &&
  n.parent.arguments[1] === n &&
  ts.isIdentifier(n.parent.expression) &&
  n.parent.expression.text === "step";

const runsInPlace = (n: ts.Node): boolean => {
  let child: ts.Node = n;
  let p = n.parent;
  while (ts.isParenthesizedExpression(p)) {
    child = p;
    p = p.parent;
  }
  return ts.isCallExpression(p) && (p.expression === child || p.arguments.includes(child as ts.Expression));
};

const functionName = (n: ts.Node): string | null => {
  if ((ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) && n.name && ts.isIdentifier(n.name))
    return n.name.text;
  const p = n.parent as ts.Node | undefined;
  if (!(ts.isArrowFunction(n) || ts.isFunctionExpression(n)) || !p) return null;
  if ((ts.isVariableDeclaration(p) || ts.isPropertyAssignment(p)) && p.initializer === n && ts.isIdentifier(p.name))
    return p.name.text;
  return null;
};

const calleeName = (call: ts.CallExpression): string | null => {
  const c = call.expression;
  if (ts.isIdentifier(c)) return c.text;
  if (ts.isPropertyAccessExpression(c)) return c.name.text;
  return null;
};

const containsThrow = (node: ts.Node): boolean => {
  let found = false;
  const walk = (n: ts.Node): void => {
    if (found || (n !== node && isFunctionLike(n))) return;
    if (ts.isThrowStatement(n)) found = true;
    ts.forEachChild(n, walk);
  };
  walk(node);
  return found;
};

function ownNodes(region: ts.Node, visit: (n: ts.Node) => void): void {
  const walk = (n: ts.Node): void => {
    if (n !== region && (isStepBody(n) || (isFunctionLike(n) && !runsInPlace(n)))) return;
    visit(n);
    if (ts.isTryStatement(n) && n.catchClause && !containsThrow(n.catchClause.block)) {
      walk(n.catchClause);
      if (n.finallyBlock) walk(n.finallyBlock);
      return;
    }
    ts.forEachChild(n, walk);
  };
  walk(region);
}

const isOriginThrow = (n: ts.Node): boolean => {
  if (!ts.isThrowStatement(n)) return false;
  const e = n.expression;
  if (!ts.isIdentifier(e)) return true;
  for (let p: ts.Node = n.parent; !ts.isSourceFile(p); p = p.parent) {
    if (ts.isCatchClause(p)) {
      const caught = p.variableDeclaration?.name;
      return !(caught && ts.isIdentifier(caught) && caught.text === e.text);
    }
    if (isFunctionLike(p)) return true;
  }
  return true;
};

const bareExpression = (e: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e)
    ? bareExpression(e.expression)
    : e;

class Throwers {
  readonly #memo = new Map<ts.Node, boolean>();
  readonly #checker: ts.TypeChecker;
  constructor(checker: ts.TypeChecker) {
    this.#checker = checker;
  }

  #declared(at: ts.Node, seen: Set<ts.Node>): ts.FunctionLikeDeclaration[] {
    let symbol = this.#checker.getSymbolAtLocation(at);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = this.#checker.getAliasedSymbol(symbol);
    return (symbol?.declarations ?? []).flatMap((d) => this.#functionsOf(d, seen));
  }

  #valueOf(e: ts.Expression, seen: Set<ts.Node>): ts.FunctionLikeDeclaration[] {
    const value = bareExpression(e);
    if (isFunctionLike(value)) return [value];
    if (ts.isIdentifier(value)) return this.#declared(value, seen);
    if (ts.isCallExpression(value)) return this.#results(value, seen);
    return [];
  }

  #results(call: ts.CallExpression, seen: Set<ts.Node>): ts.FunctionLikeDeclaration[] {
    return this.#callees(call, seen).flatMap((fn) => {
      if (!fn.body) return [];
      if (!ts.isBlock(fn.body)) return this.#valueOf(fn.body, seen);
      const out: ts.FunctionLikeDeclaration[] = [];
      ownNodes(fn.body, (n) => {
        if (ts.isReturnStatement(n) && n.expression) out.push(...this.#valueOf(n.expression, seen));
      });
      return out;
    });
  }

  #functionsOf(decl: ts.Declaration, seen: Set<ts.Node>): ts.FunctionLikeDeclaration[] {
    if (seen.has(decl)) return [];
    seen.add(decl);
    if (isFunctionLike(decl)) return [decl];
    if ((ts.isVariableDeclaration(decl) || ts.isPropertyAssignment(decl)) && decl.initializer)
      return this.#valueOf(decl.initializer, seen);
    if (ts.isShorthandPropertyAssignment(decl))
      return (this.#checker.getShorthandAssignmentValueSymbol(decl)?.declarations ?? []).flatMap((d) =>
        this.#functionsOf(d, seen),
      );
    if (ts.isBindingElement(decl)) {
      const key = decl.propertyName ?? decl.name;
      if (!ts.isIdentifier(key)) return [];
      const property = this.#checker.getTypeAtLocation(decl.parent).getProperty(key.text);
      return (property?.declarations ?? []).flatMap((d) => this.#functionsOf(d, seen));
    }
    return [];
  }

  #callees(call: ts.CallExpression, seen: Set<ts.Node>): ts.FunctionLikeDeclaration[] {
    const callee = bareExpression(call.expression);
    if (ts.isCallExpression(callee)) return this.#results(callee, seen);
    return this.#declared(ts.isPropertyAccessExpression(callee) ? callee.name : callee, seen);
  }

  #throws(fn: ts.FunctionLikeDeclaration): boolean {
    const known = this.#memo.get(fn);
    if (known !== undefined) return known;
    this.#memo.set(fn, false);
    let found = false;
    if (fn.body)
      ownNodes(fn.body, (n) => {
        if (!found && (isOriginThrow(n) || (ts.isCallExpression(n) && this.throwing(n)))) found = true;
      });
    this.#memo.set(fn, found);
    return found;
  }

  throwing(call: ts.CallExpression): boolean {
    if (CTX_THROWING_WAITS.includes(calleeName(call) ?? "")) return true;
    return this.#callees(call, new Set()).some((fn) => this.#throws(fn));
  }
}

const memos = new WeakMap<ts.Program, Throwers>();

const e2eThrowInsideStep: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        "a suite {{what}} outside every step: a failure there takes the suite down and every check after it, so it stands inside step(...) and fails its own check by name (Issue #560, handbook/specs/settle-doctrine.md)",
    },
  },
  create(context) {
    if (!repoPath(context.filename).startsWith("e2e/suites/")) return {};
    const services = context.sourceCode.parserServices as Partial<Services> | undefined;
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return {};
    const { program, esTreeNodeToTSNodeMap: toTs } = services;
    let throwers = memos.get(program);
    if (!throwers) {
      throwers = new Throwers(program.getTypeChecker());
      memos.set(program, throwers);
    }
    const known = throwers;
    return {
      Program(node) {
        const sf = toTs.get(node).getSourceFile();
        const roots: ts.Node[] = [sf];
        const findRuns = (n: ts.Node): void => {
          if (isFunctionLike(n) && functionName(n) === "run") roots.push(n);
          ts.forEachChild(n, findRuns);
        };
        findRuns(sf);
        for (const root of roots)
          ownNodes(root, (n) => {
            const what = isOriginThrow(n)
              ? "throws"
              : ts.isCallExpression(n) && known.throwing(n)
                ? `calls ${calleeName(n) ?? "a function"}, which can throw,`
                : null;
            if (what === null) return;
            const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
            context.report({ loc: { line: line + 1, column: character }, messageId: "found", data: { what } });
          });
      },
    };
  },
};

export default { rules: { "e2e-throw-inside-step": e2eThrowInsideStep } };
