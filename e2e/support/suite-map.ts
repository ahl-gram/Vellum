import type { SuiteContext } from "../types.ts";
import type { E2eSuiteName } from "./suites.ts";
import { run as runRender } from "../suites/render.ts";
import { run as runMotion } from "../suites/motion.ts";
import { run as runTurn } from "../suites/turn.ts";
import { run as runVerso } from "../suites/verso.ts";
import { run as runZoom } from "../suites/zoom.ts";
import { run as runZoomGestures } from "../suites/zoom-gestures.ts";
import { run as runGlassCeremony } from "../suites/glass-ceremony.ts";
import { run as runCards } from "../suites/cards.ts";
import { run as runHealth } from "../suites/health.ts";
import { run as runFallback } from "../suites/fallback.ts";
import { run as runHunt } from "../suites/hunt.ts";
import { run as runPrintRoom } from "../suites/print-room.ts";
import { run as runProspect } from "../suites/prospect.ts";
import { run as runRibbon } from "../suites/ribbon.ts";
import { run as runHome } from "../suites/home.ts";
import { run as runLandfall } from "../suites/landfall.ts";
import { run as runSurvey } from "../suites/survey.ts";
import { run as runBroadside } from "../suites/broadside.ts";
import { run as runReadingRoom } from "../suites/reading-room.ts";
import { run as runRoomInstrument } from "../suites/room-instrument.ts";
import { run as runRoomInk } from "../suites/room-ink.ts";
import { run as runRoomVoyage } from "../suites/room-voyage.ts";
import { run as runRoomAddress } from "../suites/room-address.ts";
import { run as runRoomVoyageRoute } from "../suites/room-voyage-route.ts";
import { run as runRunningHead } from "../suites/runninghead.ts";
import { run as runCluster } from "../suites/cluster.ts";
import { run as runChartDrawer } from "../suites/chart-drawer.ts";
import { run as runCorners } from "../suites/corners.ts";
import { run as runStage } from "../suites/stage.ts";
import { run as runDocumentRooms } from "../suites/document-rooms.ts";
import { run as runRegionDetail } from "../suites/region-detail.ts";
import { run as runSpecimen } from "../suites/specimen.ts";

export const SUITES = {
  render: runRender,
  motion: runTurn,
  turn: runMotion,
  verso: runVerso,
  zoom: runZoom,
  "zoom-gestures": runZoomGestures,
  "glass-ceremony": runGlassCeremony,
  cards: runCards,
  health: runHealth,
  fallback: runFallback,
  hunt: runHunt,
  "print-room": runPrintRoom,
  prospect: runProspect,
  ribbon: runRibbon,
  home: runHome,
  landfall: runLandfall,
  survey: runSurvey,
  broadside: runBroadside,
  "reading-room": runReadingRoom,
  "room-instrument": runRoomInstrument,
  "room-ink": runRoomInk,
  "room-voyage": runRoomVoyage,
  "room-voyage-route": runRoomVoyageRoute,
  "room-address": runRoomAddress,
  runninghead: runRunningHead,
  cluster: runCluster,
  "chart-drawer": runChartDrawer,
  "document-rooms": runDocumentRooms,
  "region-detail": runRegionDetail,
  specimen: runSpecimen,
  corners: runCorners,
  stage: runStage,
} satisfies Record<E2eSuiteName, (ctx: SuiteContext) => Promise<void>>;
