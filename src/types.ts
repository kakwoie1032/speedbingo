/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStage {
  LOBBY = 'LOBBY',
  THEME_SELECT = 'THEME_SELECT',
  BINGO_INPUT = 'BINGO_INPUT',
  GAME_PLAY = 'GAME_PLAY',
  END = 'END'
}

export interface Player {
  id: string; // Peer ID
  nickname: string;
  isHost: boolean;
  bingoGrid: string[]; // Flat representation of grid words
  checkedGrid: boolean[]; // Parallel array tracking if word was checked
  bingoCount: number; // Current number of solid lines (rows, cols, diags)
  isReady: boolean; // Ready status for bingo inputs
}

export interface GameConfig {
  gridSize: 3 | 4 | 5 | 6; // 3x3, 4x4, 5x5, 6x6
  theme: string; // Nominated theme
  themeChooserId: string; // Player ID nominated to choose the theme
}

export type PeerMessageType =
  | 'JOIN_REQUEST'
  | 'ROOM_FULL_ERROR'
  | 'PLAYER_LIST_UPDATE'
  | 'BINGO_CONFIG_UPDATE'
  | 'STAGE_TRANSITION'
  | 'THEME_ANNOUNCEMENT'
  | 'PLAYER_READY_STATUS'
  | 'PLAY_START'
  | 'START_TOUCH_TIMER'
  | 'TOUCH_CLAIM'
  | 'TOUCH_RESOLVED'
  | 'KEYWORD_CALL'
  | 'KEYWORD_CHECK_BROADCAST'
  | 'BINGO_WIN_CLAIM'
  | 'GAME_RESTART_REQUEST';

export interface PeerMessage {
  type: PeerMessageType;
  senderId: string;
  payload: any;
}
