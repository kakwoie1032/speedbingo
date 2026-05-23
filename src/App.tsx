/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkManager } from './network';
import { Player, GameConfig, GameStage, PeerMessage } from './types';
import { 
  Trophy, 
  Users, 
  Tv, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Timer, 
  CornerDownLeft, 
  RefreshCw, 
  AlertCircle,
  Hash,
  Crown,
  Share2,
  Sword,
  Bot
} from 'lucide-react';

// pre-defined thematic words for the "Auto-fill" feature
const THEMATIC_WORDS = {
  food: [
    '김치찌개', '삼겹살', '비빔밥', '떡볶이', '라면', '치킨', '피자', '파스타', 
    '돈까스', '스시', '짜장면', '탕수육', '햄버거', '샌드위치', '냉면', '보쌈', 
    '갈비찜', '칼국수', '순대국', '부대찌개', '마라탕', '족발', '감자탕', '육회', 
    '회덮밥', '쌀국수', '우동', '스테이크', '딤섬', '타코', '순두부찌개', '찜닭',
    '제육볶음', '닭갈비', '해물파전', '곱창', '핫도그', '타코야끼', '비빔냉면', '설렁탕',
    '감자튀김', '순대', '부추전', '오징어볶음', '갈비탕', '양념치킨'
  ],
  movie: [
    '아바타', '타이타닉', '어벤져스', '기생충', '인셉션', '인터스텔라', '조커', '영웅', 
    '해리포터', '겨울왕국', '극한직업', '신과함께', '도둑들', '국제시장', '명량', '베테랑', 
    '부산행', '괴물', '광해', '왕의남자', '범죄도시', '올드보이', '라라랜드', '다크나이트', 
    '글래디에이터', '타짜', '영웅본색', '반지의제왕', '스파이더맨', '토이스토리', '아이언맨',
    '매트릭스', '라스트사무라이', '인디아나존스', '해운대', '태극기휘날리며', '터미네이터', '킹스맨',
    '셜록', '쥬라기공원', '대부', '쇼생크탈출', '포레스트검프', '센과치히로', '피아니스트'
  ],
  animals: [
    '강아지', '고양이', '사자', '호랑이', '코끼리', '기린', '판다', '여우', 
    '늑대', '토끼', '다람쥐', '원숭이', '곰', '펭귄', '독수리', '고래', 
    '상어', '돌고래', '문어', '타조', '거북이', '악어', '부엉이', '참새',
    '라마', '치타', '두루미', '너구리', '캥거루', '고슴도치', '앵무새', '해파리',
    '수달', '올빼미', '까마귀', '비둘기', '낙타', '순록', '바다표범', '나무늘보',
    '코알라', '달팽이', '여치', '사마귀', '딱정벌레', '다람쥐'
  ],
  tech: [
    '컴퓨터', '노트북', '키보드', '마우스', '모니터', '스마트폰', '와이파이', '서버', 
    '블록체인', '파이썬', '자바스크립트', '리액트', '인공지능', '빅데이터', '데이터베이스', 
    '클라우드', '알고리즘', '스마트워치', '프린터', '공유기', '인터넷', '유튜브', 
    '넷플릭스', '메타버스', '코딩', '해킹', '웹브라우저', '이메일', '애플리케이션', '구글',
    '인공위성', '가상현실', '머신러닝', '딥러닝', '양자컴퓨터', '운영체제', '리눅스', '깃허브',
    '블루투스', '라즈베리파이', '암호화', '소프트웨어', '테슬라', '하드웨어'
  ],
  fruits: [
    '사과', '바나나', '딸기', '포도', '수박', '멜론', '복숭아', '귤', 
    '오렌지', '망고', '블루베리', '참외', '배', '감', '석류', '키위', 
    '자몽', '파인애플', '체리', '레몬', '아보카도', '무화과', '자두', '살구',
    '망고스틴', '코코넛', '라임', '리치', '대추', '매실', '앵두', '유자',
    '모과', '파파야', '구아바', '라즈베리', '크랜베리', '오미자', '복분자', '한라봉',
    '천혜향', '샤인머스캣', '칸탈루프', '백향과', '용과', '깔라만시'
  ],
  general: [
    '태양', '우주', '시계', '자전거', '커피', '피아노', '바다', '하늘', 
    '구름', '책', '연필', '안경', '축구', '야구', '농구', '등산', 
    '자동차', '기차', '비행기', '우산', '침대', '거울', '노래', '평화', 
    '행운', '사랑', '그림', '가방', '가위', '신발', '모자', '나무',
    '바람', '눈송이', '학교', '병원', '약국', '공원', '놀이터', '바이올린',
    '선생님', '미술관', '노란색', '무지개', '도서관', '사진기', '전화기'
  ]
};

export default function App() {
  // Local network / identification states
  const networkRef = useRef<NetworkManager | null>(null);
  const [nickname, setNickname] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCopy, setSuccessCopy] = useState(false);

  // Play state models
  const [players, setPlayers] = useState<Player[]>([]);
  const [stage, setStage] = useState<GameStage>(GameStage.LOBBY);
  const [config, setConfig] = useState<GameConfig>({
    gridSize: 4,
    theme: '',
    themeChooserId: '',
  });

  // Local grid values for custom user inputs
  const [localGrid, setLocalGrid] = useState<string[]>([]);
  const [checkedCells, setCheckedCells] = useState<boolean[]>([]);
  const [localBingoCount, setLocalBingoCount] = useState(0);
  const [localIsReady, setLocalIsReady] = useState(false);

  // Theme setup inputs
  const [customThemeInput, setCustomThemeInput] = useState('');

  // Active game cycle structures
  const [calledKeywords, setCalledKeywords] = useState<string[]>([]);
  const [touchTimerValue, setTouchTimerValue] = useState(0);
  const [maxTouchTimer, setMaxTouchTimer] = useState(0);
  const [isTouchButtonEnabled, setIsTouchButtonEnabled] = useState(false);
  const [touchWinnerId, setTouchWinnerId] = useState<string | null>(null);
  const [keywordInputValue, setKeywordInputValue] = useState('');
  const [gameLogs, setGameLogs] = useState<{ id: string; text: string; time: string }[]>([]);
  const [winnerNickname, setWinnerNickname] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-fill convenience triggers
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<keyof typeof THEMATIC_WORDS>('general');

  // Animation & game logs panel auto-scroll ref
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio syntheziser using browser Web Audio API to prevent static assets dependencies
  const playSoundEffect = (type: 'beep' | 'success' | 'bingo' | 'error' | 'click' | 'countdown') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'beep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'bingo') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'countdown') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio Context failed', e);
    }
  };

  // Add a helper to write system logs
  const appendLog = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setGameLogs(prev => [...prev, { id: Math.random().toString(), text, time: timeStr }]);
  };

  // Auto Scroll log panel
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameLogs]);

  // Sync Bingo Grid sizing
  useEffect(() => {
    const cellsLength = config.gridSize * config.gridSize;
    setLocalGrid(Array(cellsLength).fill(''));
    setCheckedCells(Array(cellsLength).fill(false));
    setLocalBingoCount(0);
    setLocalIsReady(false);
  }, [config.gridSize]);

  // Host coordinates clients list and broadcasts to everyone
  const updatePlayersList = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    if (isHost && networkRef.current) {
      networkRef.current.broadcast({
        type: 'PLAYER_LIST_UPDATE',
        senderId: myPeerId,
        payload: { players: newPlayers, gridSize: config.gridSize }
      });
    }
  };

  // Calculate current Bingo count
  const calculateBingoCount = (checked: boolean[], size: number): number => {
    let lines = 0;

    // Rows
    for (let r = 0; r < size; r++) {
      let completed = true;
      for (let c = 0; c < size; c++) {
        if (!checked[r * size + c]) {
          completed = false;
          break;
        }
      }
      if (completed) lines++;
    }

    // Columns
    for (let c = 0; c < size; c++) {
      let completed = true;
      for (let r = 0; r < size; r++) {
        if (!checked[r * size + c]) {
          completed = false;
          break;
        }
      }
      if (completed) lines++;
    }

    // Primary Diagonal (top-left to bottom-right)
    let diag1 = true;
    for (let i = 0; i < size; i++) {
      if (!checked[i * size + i]) {
        diag1 = false;
        break;
      }
    }
    if (diag1) lines++;

    // Secondary Diagonal (top-right to bottom-left)
    let diag2 = true;
    for (let i = 0; i < size; i++) {
      if (!checked[i * size + (size - 1 - i)]) {
        diag2 = false;
        break;
      }
    }
    if (diag2) lines++;

    return lines;
  };

  // Compute winning lines target threshold
  const targetBingoRequired = useMemo(() => {
    if (config.gridSize === 3) return 1;
    if (config.gridSize === 4) return 2;
    if (config.gridSize === 5) return 3;
    if (config.gridSize === 6) return 4;
    return 3;
  }, [config.gridSize]);

  // Local cell check-off side-effects
  const handleKeywordCheckAndNotify = (keyword: string, currentCalled: string[]) => {
    if (!localGrid || localGrid.length === 0) return;

    // Find if that keyword resides in our local grid (case-insensitive & whitespace trimmed)
    const targetWord = keyword.trim().toLowerCase();
    const updatedChecked = [...checkedCells];
    let matched = false;

    localGrid.forEach((word, idx) => {
      if (word.trim().toLowerCase() === targetWord) {
        updatedChecked[idx] = true;
        matched = true;
      }
    });

    if (matched) {
      setCheckedCells(updatedChecked);
      const lines = calculateBingoCount(updatedChecked, config.gridSize);
      setLocalBingoCount(lines);
      playSoundEffect('success');
      appendLog(`[매칭] 우리 빙고판에서 "${keyword}" 단어가 발견되어 X 표시했습니다!`);

      // If we reach target bingo count, claim win
      if (lines >= targetBingoRequired) {
        appendLog(`★ 축하합니다! ${lines} 줄 빙고가 완성되었습니다! BINGO 버튼을 외쳐보세요!`);
      }
    }
  };

  // Central P2P Message Parser
  const handleMessage = (msg: PeerMessage) => {
    console.log('Received Message P2P Packet:', msg);
    const { type, senderId, payload } = msg;

    switch (type) {
      case 'JOIN_REQUEST':
        if (isHost) {
          // Reject if mid-game
          if (stage !== GameStage.LOBBY) {
            networkRef.current?.sendMessage(senderId, {
              type: 'ROOM_FULL_ERROR',
              senderId: myPeerId,
              payload: { reason: '이미 게임이 진행 중입니다!' }
            });
            return;
          }

          const freshNickname = payload.nickname || `참여자-${senderId.slice(0, 4)}`;
          const exist = players.find(p => p.id === senderId);
          if (exist) return;

          const newPlayer: Player = {
            id: senderId,
            nickname: freshNickname,
            isHost: false,
            bingoGrid: [],
            checkedGrid: [],
            bingoCount: 0,
            isReady: false
          };

          const roster = [...players, newPlayer];
          appendLog(`[입장] "${freshNickname}" 님이 방에 참가했습니다.`);
          updatePlayersList(roster);
          playSoundEffect('success');

          // Send immediate configuration values to client
          networkRef.current?.sendMessage(senderId, {
            type: 'BINGO_CONFIG_UPDATE',
            senderId: myPeerId,
            payload: { gridSize: config.gridSize }
          });
        }
        break;

      case 'ROOM_FULL_ERROR':
        setErrorMsg(payload.reason);
        setIsConnecting(false);
        networkRef.current?.destroy();
        networkRef.current = null;
        playSoundEffect('error');
        break;

      case 'PLAYER_LIST_UPDATE':
        setPlayers(payload.players);
        if (payload.gridSize) {
          setConfig(prev => ({ ...prev, gridSize: payload.gridSize }));
        }
        break;

      case 'BINGO_CONFIG_UPDATE':
        setConfig(prev => ({ ...prev, gridSize: payload.gridSize }));
        break;

      case 'STAGE_TRANSITION':
        setStage(payload.stage);
        if (payload.gridSize) {
          setConfig(prev => ({ ...prev, gridSize: payload.gridSize }));
        }
        if (payload.stage === GameStage.THEME_SELECT) {
          setConfig(prev => ({ ...prev, themeChooserId: payload.themeChooserId }));
          setCalledKeywords([]);
          setTouchWinnerId(null);
          // Sync clear local ready status
          setLocalIsReady(false);
          const planner = players.find(p => p.id === payload.themeChooserId);
          appendLog(`[알림] 주제 선정 단계 진입. 무작위 주제 선정자: "${planner?.nickname || '??'}"`);
        }
        break;

      case 'THEME_ANNOUNCEMENT':
        if (isHost && senderId !== myPeerId) {
          // Broadcast to everyone else
          networkRef.current?.broadcast({
            type: 'THEME_ANNOUNCEMENT',
            senderId: myPeerId,
            payload: { theme: payload.theme, gridSize: config.gridSize }
          });
        }
        setConfig(prev => {
          const next = { ...prev, theme: payload.theme };
          if (payload.gridSize) {
            next.gridSize = payload.gridSize;
          }
          return next;
        });
        appendLog(`[주제] 이번 게임의 빙고판 주제는 "${payload.theme}" 입니다! 단어를 채워 넣으세요.`);
        setStage(GameStage.BINGO_INPUT);
        playSoundEffect('success');
        break;

      case 'PLAYER_READY_STATUS':
        if (isHost) {
          const updated = players.map(p => {
            if (p.id === senderId) {
              return { ...p, isReady: payload.isReady, bingoGrid: payload.bingoGrid };
            }
            return p;
          });
          
          appendLog(`[준비완료] "${players.find(p => p.id === senderId)?.nickname}" 님이 키워드 입력을 완료했습니다.`);
          updatePlayersList(updated);

          // If everyone is ready (including Host if they are ready)
          const everyoneReady = updated.every(p => p.isReady);
          if (everyoneReady) {
            appendLog(`[매치시작] 모든 유저가 준비를 마쳤습니다! 게임 플레이를 시작합니다.`);
            // Host transitions everyone to gameplay
            networkRef.current?.broadcast({
              type: 'STAGE_TRANSITION',
              senderId: myPeerId,
              payload: { stage: GameStage.GAME_PLAY, gridSize: config.gridSize }
            });
            setStage(GameStage.GAME_PLAY);

            // Trigger the initial speed touch timer setup
            setTimeout(() => {
              triggerNextTouchRound();
            }, 2000);
          }
        }
        break;

      case 'START_TOUCH_TIMER': {
        // Stop current active interval
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setTouchWinnerId(null);
        setTouchTimerValue(payload.durationSeconds);
        setMaxTouchTimer(payload.durationSeconds);
        setIsTouchButtonEnabled(true);
        playSoundEffect('beep');
        appendLog(`[순발력 터치] ${payload.durationSeconds}초 타이머 발동! 화면 중앙의 TOUCH 버튼을 가장 먼저 누르세요!`);

        const startTimestamp = Date.now();
        countdownIntervalRef.current = setInterval(() => {
          const delta = (Date.now() - startTimestamp) / 1000;
          const remaining = Math.max(0, payload.durationSeconds - delta);
          setTouchTimerValue(remaining);

          if (remaining <= 0) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setIsTouchButtonEnabled(false);
            if (isHost) {
              appendLog(`[시간 초과] 선점을 한 유저가 없어 터치 턴을 재개합니다.`);
              setTimeout(() => {
                triggerNextTouchRound();
              }, 2000);
            }
          }
        }, 50);
        break;
      }

      case 'TOUCH_CLAIM':
        if (isHost) {
          // If somebody claimed first and we didn't resolve yet
          if (!touchWinnerId) {
            setTouchWinnerId(senderId);
            setIsTouchButtonEnabled(false);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

            const winnerNickname = players.find(p => p.id === senderId)?.nickname || '알 수 없음';
            appendLog(`[터치 선점완료] 가장 먼저 터치한 유저가 감지되었습니다: "${winnerNickname}"`);

            // Broadcast success winner
            networkRef.current?.broadcast({
              type: 'TOUCH_RESOLVED',
              senderId: myPeerId,
              payload: { winnerId: senderId, winnerNickname: winnerNickname }
            });

            // Stop local timer values
            setTouchWinnerId(senderId);
            playSoundEffect('success');
          }
        }
        break;

      case 'TOUCH_RESOLVED':
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setIsTouchButtonEnabled(false);
        setTouchWinnerId(payload.winnerId);
        playSoundEffect('success');
        appendLog(`[선점 확정] "${payload.winnerNickname}" 님이 가장 빠르게 터치하여 선(턴)을 획득했습니다!`);
        break;

      case 'KEYWORD_CHECK_BROADCAST': {
        const word = payload.keyword;
        const currentList = payload.calledKeywords;
        setCalledKeywords(currentList);
        appendLog(`📢 "${payload.senderNickname}" 님이 외친 키워드: [ ${word} ]`);
        
        // Mark grid cell checks
        handleKeywordCheckAndNotify(word, currentList);

        // Host checks if any players completed a winning condition automatically, or waits for client claims
        break;
      }

      case 'BINGO_WIN_CLAIM': {
        // We received target claim. Ensure validity
        const winner = players.find(p => p.id === senderId);
        appendLog(`🏆 [우승] "${winner?.nickname || senderId}" 님이 빙고를 완수하고 승리를 거머쥐었습니다!`);
        setWinnerNickname(winner?.nickname || senderId);
        setStage(GameStage.END);
        playSoundEffect('bingo');

        if (isHost) {
          networkRef.current?.broadcast({
            type: 'STAGE_TRANSITION',
            senderId: myPeerId,
            payload: { stage: GameStage.END }
          });
          // Send notification of final winner name
          networkRef.current?.broadcast({
            type: 'BINGO_WIN_CLAIM',
            senderId: myPeerId,
            payload: { id: senderId, nickname: winner?.nickname || senderId }
          });
        }
        break;
      }

      case 'GAME_RESTART_REQUEST':
        // Reset local variables
        setStage(GameStage.LOBBY);
        setCalledKeywords([]);
        setLocalGrid(Array(config.gridSize * config.gridSize).fill(''));
        setCheckedCells(Array(config.gridSize * config.gridSize).fill(false));
        setLocalBingoCount(0);
        setLocalIsReady(false);
        setTouchWinnerId(null);
        setWinnerNickname('');
        appendLog('[대기] 게임이 초기화되었습니다. 방장의 시작을 대기 중입니다...');
        break;

      case 'KEYWORD_CALL':
        if (isHost) {
          const pickedWord = payload.keyword;
          const finder = players.find(p => p.id === senderId);
          const callerNick = finder ? finder.nickname : '참여자';

          const currentList = [...calledKeywords, pickedWord];
          setCalledKeywords(currentList);

          networkRef.current?.broadcast({
            type: 'KEYWORD_CHECK_BROADCAST',
            senderId: myPeerId,
            payload: {
              keyword: pickedWord,
              calledKeywords: currentList,
              senderNickname: callerNick
            }
          });

          // Local Host check
          handleMessage({
            type: 'KEYWORD_CHECK_BROADCAST',
            senderId: myPeerId,
            payload: {
              keyword: pickedWord,
              calledKeywords: currentList,
              senderNickname: callerNick
            }
          });

          // Schedule next speed touch round
          setTimeout(() => {
            if (networkRef.current) {
              triggerNextTouchRound();
            }
          }, 4000);
        }
        break;

      default:
        console.log('Unhandled peer packet event', type);
        break;
    }
  };

  // Keep peer message handler always pointing to the latest React state (no stale closures)
  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.onMessageReceived = handleMessage;
    }
  }, [handleMessage]);

  // Host starts the speed touch countdown interval
  const triggerNextTouchRound = () => {
    if (!isHost) return;

    // Roll random count between 5 to 10 seconds (e.g., 6.5s)
    const randomSec = Math.floor(Math.random() * 6) + 5; // 5 to 10
    
    // Reset winner
    setTouchWinnerId(null);

    // Broadcast timer start
    networkRef.current?.broadcast({
      type: 'START_TOUCH_TIMER',
      senderId: myPeerId,
      payload: { durationSeconds: randomSec }
    });

    // Handle local start
    handleMessage({
      type: 'START_TOUCH_TIMER',
      senderId: myPeerId,
      payload: { durationSeconds: randomSec }
    });
  };

  // Host creates the Peer Room
  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해 주세요.');
      playSoundEffect('error');
      return;
    }
    setErrorMsg('');
    setIsConnecting(true);

    try {
      const manager = new NetworkManager();
      networkRef.current = manager;

      manager.onMessageReceived = handleMessage;
      manager.onConnectionOpened = (id) => {
        // Discovered open connection
      };
      manager.onConnectionClosed = (id) => {
        setPlayers(prev => {
          const removed = prev.filter(p => p.id !== id);
          appendLog(`[퇴장] 플레이어가 접속 해제되었습니다.`);
          return removed;
        });
      };
      manager.onError = (err) => {
        setErrorMsg(err);
      };

      const openedId = await manager.initialize(nickname);
      setMyPeerId(openedId);
      setIsHost(true);
      setIsConnected(true);
      setIsConnecting(false);

      // Create self Player object
      const selfPlayer: Player = {
        id: openedId,
        nickname: nickname,
        isHost: true,
        bingoGrid: [],
        checkedGrid: [],
        bingoCount: 0,
        isReady: false
      };

      setPlayers([selfPlayer]);
      appendLog(`[호스트] 대기방이 생성되었습니다. 방 번호: ${openedId}`);
      playSoundEffect('success');
    } catch (e: any) {
      setErrorMsg(e.message || '방을 생성할 수 없습니다.');
      setIsConnecting(false);
      playSoundEffect('error');
    }
  };

  // Client Joins existing Room
  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해 주세요.');
      playSoundEffect('error');
      return;
    }
    if (!targetRoomId.trim()) {
      setErrorMsg('입장할 방 번호(Room ID)를 입력해 주세요.');
      playSoundEffect('error');
      return;
    }
    setErrorMsg('');
    setIsConnecting(true);

    try {
      const manager = new NetworkManager();
      networkRef.current = manager;

      manager.onMessageReceived = handleMessage;
      manager.onConnectionOpened = (id) => {
        setIsConnected(true);
        setIsConnecting(false);
        appendLog(`[접속] 방장 서버에 정상 연결되었습니다! 닉네임 전송 중...`);

        // Send Join Request
        manager.sendMessage(targetRoomId, {
          type: 'JOIN_REQUEST',
          senderId: id,
          payload: { nickname: nickname }
        });
      };
      manager.onConnectionClosed = () => {
        setIsConnected(false);
        setStage(GameStage.LOBBY);
        appendLog(`[오류] 방장과의 연결이 끊겼습니다.`);
      };
      manager.onError = (err) => {
        setErrorMsg(err);
      };

      const openedId = await manager.initialize(nickname, targetRoomId);
      setMyPeerId(openedId);
      setIsHost(false);
      playSoundEffect('success');
    } catch (e: any) {
      setErrorMsg(e.message || '방에 입장하는 도중 장애가 일어났습니다.');
      setIsConnecting(false);
      playSoundEffect('error');
    }
  };

  // Host changes parameters (gridSize)
  const handleConfigGridSize = (size: 3 | 4 | 5 | 6) => {
    if (!isHost) return;
    playSoundEffect('click');
    setConfig(prev => ({ ...prev, gridSize: size }));

    networkRef.current?.broadcast({
      type: 'BINGO_CONFIG_UPDATE',
      senderId: myPeerId,
      payload: { gridSize: size }
    });
  };

  // Host triggers the game start sequence
  const handleStartGameSequence = () => {
    if (!isHost) return;
    playSoundEffect('click');

    // Select randomly 1 Theme Chooser among players
    if (players.length === 0) return;
    const pickerIdx = Math.floor(Math.random() * players.length);
    const nominee = players[pickerIdx];

    appendLog(`[호스트] 게임을 개시합니다! 주제 선정자로 무작위 지정된 인물: ${nominee.nickname}`);

    networkRef.current?.broadcast({
      type: 'STAGE_TRANSITION',
      senderId: myPeerId,
      payload: {
        stage: GameStage.THEME_SELECT,
        themeChooserId: nominee.id,
        gridSize: config.gridSize
      }
    });

    handleMessage({
      type: 'STAGE_TRANSITION',
      senderId: myPeerId,
      payload: {
        stage: GameStage.THEME_SELECT,
        themeChooserId: nominee.id,
        gridSize: config.gridSize
      }
    });
  };

  // Chooser confirms the theme
  const handleConfirmTheme = () => {
    if (!customThemeInput.trim()) {
      alert('주제를 정확히 입력하세요!');
      return;
    }
    playSoundEffect('click');

    const announcedTheme = customThemeInput.trim();

    if (isHost) {
      networkRef.current?.broadcast({
        type: 'THEME_ANNOUNCEMENT',
        senderId: myPeerId,
        payload: { theme: announcedTheme, gridSize: config.gridSize }
      });
      handleMessage({
        type: 'THEME_ANNOUNCEMENT',
        senderId: myPeerId,
        payload: { theme: announcedTheme, gridSize: config.gridSize }
      });
    } else {
      // Sent back to host to broadcast
      networkRef.current?.sendMessage(targetRoomId, {
        type: 'THEME_ANNOUNCEMENT',
        senderId: myPeerId,
        payload: { theme: announcedTheme, gridSize: config.gridSize }
      });
    }
  };

  // Auto fill helper
  const handleAutoFillKeywords = () => {
    playSoundEffect('click');
    const wordsPool = THEMATIC_WORDS[selectedThemeCategory] || THEMATIC_WORDS.general;
    
    // Shuffle wordsPool
    const shuffled = [...wordsPool].sort(() => 0.5 - Math.random());
    const requiredSize = config.gridSize * config.gridSize;
    const slices = shuffled.slice(0, requiredSize);

    // If we don't have enough, pad with empty elements
    while (slices.length < requiredSize) {
      slices.push(`지정단어-${slices.length + 1}`);
    }

    setLocalGrid(slices);
    appendLog(`[기능] 카테고리 [${selectedThemeCategory}]의 단어로 빙고판을 자동 채웠습니다.`);
  };

  // Submit local filled bingo grid to Host
  const handleSubmitBingoGrid = () => {
    // Audit that everything is filled
    const invalid = localGrid.some(v => !v.trim());
    if (invalid) {
      alert('모든 빙고판 칸을 공백 없이 입력하셔야 준비완료할 수 있습니다!');
      playSoundEffect('error');
      return;
    }
    playSoundEffect('success');
    setLocalIsReady(true);

    if (isHost) {
      const updated = players.map(p => {
        if (p.id === myPeerId) {
          return { ...p, isReady: true, bingoGrid: localGrid };
        }
        return p;
      });
      updatePlayersList(updated);

      // If playing single-player or everyone happens to be ready
      const everyoneReady = updated.every(p => p.isReady);
      if (everyoneReady) {
        appendLog(`[매치시작] 즐거운 대국이 시작됩니다!`);
        networkRef.current?.broadcast({
          type: 'STAGE_TRANSITION',
          senderId: myPeerId,
          payload: { stage: GameStage.GAME_PLAY, gridSize: config.gridSize }
        });
        setStage(GameStage.GAME_PLAY);

        // Turn start
        setTimeout(() => {
          triggerNextTouchRound();
        }, 1500);
      }
    } else {
      // Send readiness back to Host
      networkRef.current?.sendMessage(targetRoomId, {
        type: 'PLAYER_READY_STATUS',
        senderId: myPeerId,
        payload: { isReady: true, bingoGrid: localGrid }
      });
    }
  };

  // The central Speed "TOUCH" Button press
  const handleTouchButtonPress = () => {
    if (!isTouchButtonEnabled || touchWinnerId) return;
    playSoundEffect('click');
    setIsTouchButtonEnabled(false);

    if (isHost) {
      // Direct local winner evaluation
      setTouchWinnerId(myPeerId);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      appendLog(`[터치 선점완료] 방장이 가장 먼저 버튼을 터치하였습니다!`);
      networkRef.current?.broadcast({
        type: 'TOUCH_RESOLVED',
        senderId: myPeerId,
        payload: { winnerId: myPeerId, winnerNickname: nickname }
      });
    } else {
      // Send claim to Host
      networkRef.current?.sendMessage(targetRoomId, {
        type: 'TOUCH_CLAIM',
        senderId: myPeerId,
        payload: {}
      });
    }
  };

  // Winner submits keyword
  const handleKeywordCallSubmission = () => {
    if (!keywordInputValue.trim()) {
      alert('외칠 키워드를 올바르게 기입하세요!');
      return;
    }
    const pickedWord = keywordInputValue.trim();

    // Clear input
    setKeywordInputValue('');
    playSoundEffect('success');

    const winnerNick = players.find(p => p.id === myPeerId)?.nickname || '방장';

    if (isHost) {
      const currentList = [...calledKeywords, pickedWord];
      setCalledKeywords(currentList);

      networkRef.current?.broadcast({
        type: 'KEYWORD_CHECK_BROADCAST',
        senderId: myPeerId,
        payload: {
          keyword: pickedWord,
          calledKeywords: currentList,
          senderNickname: winnerNick
        }
      });

      // Self-eval
      handleMessage({
        type: 'KEYWORD_CHECK_BROADCAST',
        senderId: myPeerId,
        payload: {
          keyword: pickedWord,
          calledKeywords: currentList,
          senderNickname: winnerNick
        }
      });

      // Move to next Speed-Touch turn after a short readable delay
      setTimeout(() => {
        if (stage === GameStage.GAME_PLAY) {
          triggerNextTouchRound();
        }
      }, 4000);

    } else {
      // Send verification to Host
      networkRef.current?.sendMessage(targetRoomId, {
        type: 'KEYWORD_CALL',
        senderId: myPeerId,
        payload: { keyword: pickedWord }
      });

      // Host receives KEYWORD_CALL inside central system of messages
      // Wait, let's look at the PeerJS events parser. We should map KEYWORD_CALL in Host messages!
    }
  };

  // Click direct manually shout BINGO!
  const handleShoutBingoWinner = () => {
    if (localBingoCount < targetBingoRequired) {
      alert(`최소 ${targetBingoRequired} 줄 이상 맞춰야 우승을 선포할 수 있습니다! (현재 완성: ${localBingoCount} 줄)`);
      playSoundEffect('error');
      return;
    }

    playSoundEffect('bingo');
    appendLog(`★ [BINGO!] 당신이 ${localBingoCount} 줄 달성을 외쳤습니다!`);

    if (isHost) {
      handleMessage({
        type: 'BINGO_WIN_CLAIM',
        senderId: myPeerId,
        payload: { id: myPeerId, nickname: nickname }
      });
    } else {
      networkRef.current?.sendMessage(targetRoomId, {
        type: 'BINGO_WIN_CLAIM',
        senderId: myPeerId,
        payload: { id: myPeerId, nickname: nickname }
      });
    }
  };

  // Host restarts the round
  const handleRestartNewRound = () => {
    if (!isHost) return;
    playSoundEffect('click');

    // Broadcast restart request
    networkRef.current?.broadcast({
      type: 'GAME_RESTART_REQUEST',
      senderId: myPeerId,
      payload: {}
    });

    // Reset local
    handleMessage({
      type: 'GAME_RESTART_REQUEST',
      senderId: myPeerId,
      payload: {}
    });
  };

  // Copy Room ID utility
  const handleCopyRoomIdToClipboard = () => {
    if (!myPeerId) return;
    navigator.clipboard.writeText(myPeerId);
    setSuccessCopy(true);
    playSoundEffect('click');
    setTimeout(() => {
      setSuccessCopy(false);
    }, 2000);
  };

  // Auto clean-up references
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans antialiased selection:bg-[#D4AC0D] selection:text-black">
      
      {/* Bento Header Section */}
      <header className="flex justify-between items-center mb-6 px-4 py-4 border-b border-[#222] bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#600018] rounded-[8px] flex items-center justify-center border border-[#D4AC0D] rotate-[-2deg] shadow-[0_0_10px_rgba(212,172,13,0.2)]">
            <span className="font-display font-black text-xl text-[#D4AC0D]">B</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none font-display">
              Speed Touch <span className="text-[#D4AC0D]">Bingo</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-mono">Real-time P2P Battle Engine</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <button
            onClick={() => { setSoundEnabled(!soundEnabled); playSoundEffect('click'); }}
            className="p-2 bg-[#151515] border border-[#222] rounded-lg text-stone-200 hover:bg-[#202020] transition-colors cursor-pointer"
            title={soundEnabled ? '음소거' : '소리 켜기'}
            id="sound-toggle-btn"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AC0D]" /> : <VolumeX className="w-4 h-4 text-[#600018]" />}
          </button>

          {isConnected && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[9px] opacity-40 uppercase tracking-wider">Room ID</span>
                <span className="font-mono font-bold text-xs text-[#D4AC0D] cursor-pointer hover:underline" onClick={handleCopyRoomIdToClipboard}>
                  {myPeerId.slice(0, 10)}...
                </span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center space-x-2 bg-black/60 px-3 py-1.5 rounded-lg border border-[#222] text-[10px] font-mono">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {stage === GameStage.GAME_PLAY ? (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
            {/* Left side: Players & Stats */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Room Info */}
              <div className="bg-[#151515] border border-[#222] rounded-[12px] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AC0D]">Room Information</span>
                  <span className="text-[9px] bg-[#600018]/30 border border-[#600018]/50 px-1.5 py-0.5 rounded text-white/70 font-mono">
                    {isHost ? 'HOST' : 'CLIENT'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase block mb-1">Room ID (Click to Copy)</span>
                    <div 
                      onClick={handleCopyRoomIdToClipboard}
                      className="bg-black/80 border border-[#222] py-2 px-3 rounded-lg text-[11px] font-mono text-[#D4AC0D] cursor-pointer hover:border-[#D4AC0D]/50 transition-colors flex items-center justify-between truncate"
                    >
                      <span className="truncate">{myPeerId}</span>
                      {successCopy ? <Check className="w-3 h-3 text-green-400 shrink-0" /> : <Copy className="w-3 h-3 text-white/40 shrink-0 ml-1" />}
                    </div>
                  </div>
                  {isHost && (
                    <button 
                      onClick={handleRestartNewRound}
                      className="w-full text-[10px] bg-[#600018] hover:bg-[#800020] border border-[#D4AC0D]/20 py-1.5 px-3 rounded-md font-bold text-white uppercase transition-all cursor-pointer"
                    >
                      Reset Game
                    </button>
                  )}
                </div>
              </div>

              {/* My Status */}
              <div className="bg-[#151515] border border-[#222] rounded-[12px] p-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">My Status</h2>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#D4AC0D]">{localBingoCount}</div>
                    <div className="text-[8px] uppercase opacity-50 font-mono font-bold">Lines</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-stone-200">
                      {checkedCells.filter(Boolean).length}
                    </div>
                    <div className="text-[8px] uppercase opacity-50 font-mono font-bold">Hits</div>
                  </div>
                </div>
              </div>

              {/* Guest/Players card */}
              <div className="bg-[#151515] border border-[#222] rounded-[12px] p-4 flex-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4AC0D] mb-4 flex justify-between items-center">
                  Players <span>{players.length} / 8</span>
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {players.map((p, idx) => {
                    const isMe = p.id === myPeerId;
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg ${
                        isMe ? 'bg-[#600018]/25 border-l-2 border-[#D4AC0D]' : 'hover:bg-white/5'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30 font-mono">#{idx+1}</span>
                          <span className={`text-sm font-semibold truncate max-w-[120px] ${isMe ? 'text-[#D4AC0D]' : 'text-white/80'}`}>
                            {p.nickname}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {p.isHost && <span className="text-[8px] bg-[#600018] text-[#D4AC0D] border border-[#D4AC0D]/50 px-1 rounded font-bold">Host</span>}
                          {p.bingoCount > 0 && <span className="text-[9px] bg-black text-[#D4AC0D] px-1.5 rounded font-mono font-bold">{p.bingoCount}L</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center: Bingo Board */}
            <div className="lg:col-span-6 bg-[#151515] border-2 border-[#600018] rounded-[12px] p-4 md:p-5 flex flex-col min-h-[460px] justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    SUBJECT: <span className="text-[#D4AC0D]">{config.theme || 'NONE'}</span>
                  </span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded font-mono font-bold uppercase">
                    {config.gridSize} X {config.gridSize} Grid
                  </span>
                </div>

                <div 
                  className="grid gap-2 mb-4"
                  style={{
                    gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`
                  }}
                >
                  {localGrid.map((word, idx) => {
                    const isChecked = checkedCells[idx];
                    const isLongWord = word.length > 8;
                    return (
                      <div 
                        key={idx}
                        className={`aspect-square flex flex-col items-center justify-center text-center p-1.5 font-bold transition-all relative overflow-hidden select-none border rounded-[6px] ${
                          isChecked
                            ? 'bg-[#600018]/80 border-[#D4AC0D] text-white scale-95 shadow-inner'
                            : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/90 hover:border-white/20 hover:bg-[#202020]'
                        }`}
                      >
                        <span className={`relative z-10 font-sans tracking-tight leading-3 font-semibold break-all ${isLongWord ? 'text-[9px]' : 'text-[11px] md:text-xs'}`}>
                          {word}
                        </span>
                        
                        {isChecked && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 bg-[#600018]/40"
                          >
                            <div className="text-white/25 text-3xl font-serif font-black select-none pointer-events-none">X</div>
                          </motion.div>
                        )}

                        <span className="absolute bottom-0.5 right-1.5 text-[8px] text-white/25 font-mono z-10 select-none">#{idx+1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Claim Winner Controls */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40">조건 충족 시 우승 외치기를 클릭하세요.</p>
                  <span className="text-xs text-white/70">목표: <strong className="text-[#D4AC0D] font-bold">{targetBingoRequired}줄 채우기</strong> (현재: {localBingoCount}줄)</span>
                </div>

                <button
                  onClick={handleShoutBingoWinner}
                  className={`py-2 px-5 rounded-lg border-2 border-black font-extrabold text-xs transition duration-155 active:translate-y-0.5 cursor-pointer ${
                    localBingoCount >= targetBingoRequired
                      ? 'bg-gradient-to-r from-[#D4AC0D] to-[#B7950B] shadow-[0_0_20px_rgba(212,172,13,0.3)] text-black font-black animate-pulse'
                      : 'bg-[#222] text-white/30 border-[#111] cursor-not-allowed'
                  }`}
                  id="shout-bingo-btn"
                >
                  BINGO! 우승 외치기
                </button>
              </div>
            </div>

            {/* Right side: Turn System & Log */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Turn & Touch Area */}
              <div className="bg-[#151515] border-2 border-[#D4AC0D] rounded-[12px] flex-1 flex flex-col items-center justify-center p-5 relative overflow-hidden">
                <div className="text-center mb-4 relative z-10 w-full">
                  <span className="block text-[9px] uppercase tracking-widest text-[#D4AC0D] mb-1 font-bold">
                    {touchWinnerId ? 'TURN CLAIMED' : 'Touch Buzzer Running'}
                  </span>
                  <div className="text-3xl font-black text-white font-mono tabular-nums leading-none">
                    {touchTimerValue.toFixed(2)}s
                  </div>
                  
                  <div className="mt-1.5 h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-[#222]">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#600018] to-[#800020]"
                      animate={{ width: maxTouchTimer ? `${(touchTimerValue / maxTouchTimer) * 100}%` : '0%' }}
                      transition={{ duration: 0.05, ease: 'linear' }}
                    />
                  </div>
                </div>
                
                <div className="relative flex items-center justify-center w-full py-2">
                  {!touchWinnerId && isTouchButtonEnabled && (
                    <div className="absolute w-28 h-28 rounded-full bg-[#D4AC0D]/10 animate-ping"></div>
                  )}
                  
                  {touchWinnerId ? (
                    <div className="text-center py-2 space-y-2 relative z-10">
                      <div className="w-12 h-12 bg-[#600018] rounded-full flex items-center justify-center mx-auto border border-[#D4AC0D] shadow-[0_0_15px_rgba(212,172,13,0.3)]">
                        <span className="text-white text-md font-bold">🎯</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white/90 block">
                          {players.find(p => p.id === touchWinnerId)?.nickname || '누군가'}
                        </span>
                        <span className="text-[8px] tracking-wider uppercase bg-[#600018] text-[#D4AC0D] py-0.5 px-2 rounded font-bold border border-[#D4AC0D]/30 inline-block mt-0.5 font-sans">
                          TURN WINNER
                        </span>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: isTouchButtonEnabled ? 1.05 : 1 }}
                      whileTap={{ scale: isTouchButtonEnabled ? 0.95 : 1 }}
                      onClick={handleTouchButtonPress}
                      disabled={!isTouchButtonEnabled}
                      className={`w-24 h-24 rounded-full border-4 border-black text-black font-black text-base select-none cursor-pointer transition-all flex flex-col items-center justify-center ${
                        isTouchButtonEnabled
                          ? 'touch-btn active:scale-95'
                          : 'bg-[#222] text-white/10 border-[#111] pointer-events-none'
                      }`}
                      style={isTouchButtonEnabled ? {
                        background: 'radial-gradient(circle, #D4AC0D 0%, #B7950B 100%)',
                        boxShadow: '0 0 40px rgba(212, 172, 13, 0.3)'
                      } : {}}
                      id="speed-touch-buzzer"
                    >
                      <span className="font-display font-extrabold text-sm tracking-tighter text-black">TOUCH!</span>
                      <span className="text-[8px] font-mono tracking-widest leading-none mt-0.5 text-black/80">
                        {isTouchButtonEnabled ? 'NOW' : 'WAIT'}
                      </span>
                    </motion.button>
                  )}
                </div>
                
                <div className="mt-4 text-center border-t border-[#222] pt-3 w-full">
                  {touchWinnerId === myPeerId ? (
                    <div className="space-y-2">
                      <span className="text-[9px] bg-[#600018] text-[#D4AC0D] font-bold px-2 py-0.5 rounded border border-[#D4AC0D]/20 inline-block">외칠 단어를 선택하세요!</span>
                      
                      {/* Convenience quick-click list of unchecked words */}
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-black/60 rounded border border-[#222]">
                        {localGrid.map((w, idx) => {
                          if (checkedCells[idx]) return null;
                          return (
                            <button
                              key={idx}
                              onClick={() => setKeywordInputValue(w)}
                              className="text-[9px] bg-[#1a1a1a] hover:bg-[#303030] hover:text-[#D4AC0D] px-1.5 py-0.5 rounded border border-[#222] text-white/70 font-semibold transition-all cursor-pointer"
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex space-x-1">
                        <input
                          type="text"
                          value={keywordInputValue}
                          onChange={(e) => setKeywordInputValue(e.target.value)}
                          placeholder="단어 입력"
                          className="flex-1 bg-black border border-[#333] py-1 px-2 rounded-md text-xs font-bold focus:outline-none focus:border-[#D4AC0D] text-white"
                          id="keyword-call-input"
                        />
                        <button
                          onClick={handleKeywordCallSubmission}
                          className="bg-[#600018] hover:bg-[#800020] border border-[#D4AC0D]/30 text-white text-[10px] font-bold px-2.5 rounded transition-all cursor-pointer"
                        >
                          부르기
                        </button>
                      </div>
                    </div>
                  ) : touchWinnerId ? (
                    <span className="text-[10px] opacity-50 block uppercase tracking-wider italic">
                      "{players.find(p => p.id === touchWinnerId)?.nickname}" 님이 외치는 중...
                    </span>
                  ) : (
                    <p className="text-[9px] leading-tight text-white/50 uppercase">
                      타이머 진행 중 버튼을 가장 먼저 터치해서<br/>빙고를 지울 기회를 잡으세요!
                    </p>
                  )}
                </div>
              </div>

              {/* Action Log Card */}
              <div className="bg-[#151515] border border-[#222] h-48 rounded-[12px] p-4 flex flex-col justify-between overflow-hidden">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#D4AC0D] mb-2 pb-1.5 border-b border-[#222] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Action Log
                </h2>
                <div 
                  ref={logContainerRef}
                  className="flex-1 space-y-1.5 text-[10px] font-mono overflow-y-auto scrollbar-none text-white/85"
                >
                  {gameLogs.length === 0 ? (
                    <div className="text-white/30 italic text-center py-10">이곳에 실시간 게임 일지가 수신됩니다...</div>
                  ) : (
                    gameLogs.map((log) => (
                      <div key={log.id} className="leading-tight text-left">
                        <span className="text-[#D4AC0D]/70 mr-1">[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="lg:col-span-4 space-y-6">
              {!isConnected ? (
                <div className="bg-[#151515] border border-[#222] p-5 rounded-[12px] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-[#600018] text-white text-[9px] font-bold px-3 uppercase border-b border-l border-[#222] font-mono">
                    ENTER
                  </div>
                  
                  <h2 className="font-display font-black text-lg text-[#D4AC0D] mb-4 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#D4AC0D]" />
                    <span>방 참가 / 생성하기</span>
                  </h2>

                  {errorMsg && (
                    <div className="mb-4 bg-[#600018]/20 border border-[#600018]/50 text-stone-200 p-3 rounded-lg flex items-start space-x-2 text-xs">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#D4AC0D]" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 tracking-wider">플레이어 닉네임</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="내 닉네임 입력 (최대 10자)"
                        className="w-full bg-black border border-[#222] py-2.5 px-4 rounded-xl text-stone-100 placeholder-neutral-650 focus:border-[#D4AC0D] focus:outline-none transition font-medium text-sm"
                        id="nickname-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <div className="border border-[#222] p-3.5 rounded-xl bg-black/40">
                        <span className="text-[9px] bg-[#600018] py-0.5 px-2 rounded font-bold text-white mb-2 inline-block border border-white/10 uppercase font-mono">Host Game</span>
                        <button
                          onClick={handleCreateRoom}
                          disabled={isConnecting}
                          className="w-full bg-[#600018] hover:bg-[#800020] text-white font-extrabold py-2.5 px-4 rounded-xl border border-[#D4AC0D]/30 transition shadow-lg active:translate-y-0.5 disabled:opacity-50 text-sm cursor-pointer uppercase tracking-wider"
                          id="create-room-btn"
                        >
                          {isConnecting && isHost ? '대기방 개설 중...' : '방 새로고침 / 개설'}
                        </button>
                      </div>

                      <div className="border border-[#222] p-3.5 rounded-xl bg-black/40 space-y-2.5">
                        <span className="text-[9px] bg-[#D4AC0D] py-0.5 px-2 rounded font-bold text-black mb-2 inline-block uppercase font-mono">Join Game</span>
                        <div>
                          <input
                            type="text"
                            value={targetRoomId}
                            onChange={(e) => setTargetRoomId(e.target.value)}
                            placeholder="입장할 Room ID"
                            className="w-full bg-black border border-[#222] py-2 px-3 rounded-xl text-stone-100 placeholder-neutral-700 focus:border-[#D4AC0D] focus:outline-none font-mono text-xs"
                            id="room-id-input"
                          />
                        </div>
                        <button
                          onClick={handleJoinRoom}
                          disabled={isConnecting}
                          className="w-full bg-[#D4AC0D] hover:bg-[#e0b716] text-black font-extrabold py-2.5 px-4 rounded-xl border border-black/30 transition shadow-lg active:translate-y-0.5 disabled:opacity-50 text-sm cursor-pointer uppercase tracking-wider"
                          id="join-room-btn"
                        >
                          {isConnecting && !isHost ? '방 참가 시도 중...' : '방 연결 및 입장'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#151515] border border-[#222] p-5 rounded-[12px] shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
                    <span className="text-[10px] bg-[#600018] text-[#D4AC0D] py-0.5 px-2 rounded border border-[#D4AC0D]/20 font-mono font-bold">
                      {isHost ? '🎮 HOST' : '👤 CLIENT'}
                    </span>
                    <span className="text-[10px] text-white/50">내 PeerID: <strong className="font-mono text-[#D4AC0D]">{myPeerId.slice(0, 6)}</strong></span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 mb-1 uppercase tracking-wider">공유방 번호 (Room ID)</label>
                      <div className="flex space-x-2">
                        <div className="flex-1 bg-black border border-[#222] py-2 px-3 rounded-xl font-mono text-xs text-[#D4AC0D] truncate tracking-tight flex items-center justify-between">
                          <span className="truncate">{myPeerId}</span>
                        </div>
                        <button
                          onClick={handleCopyRoomIdToClipboard}
                          className="p-2.5 bg-[#1e1e1e] hover:bg-[#252525] rounded-xl border border-[#222] transition text-[#D4AC0D] shrink-0 cursor-pointer"
                          title="복사하기"
                        >
                          {successCopy ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">친구에게 이 코드를 전송하여 방에 참가하게 만드세요.</p>
                    </div>

                    {isHost && stage === GameStage.LOBBY && (
                      <div className="pt-2 border-t border-[#222]">
                        <label className="block text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">빙고판 크기 설정</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {([3, 4, 5, 6] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => handleConfigGridSize(size)}
                              className={`py-2 px-1 rounded-lg border font-bold transition-all text-[11px] font-mono cursor-pointer ${
                                config.gridSize === size 
                                  ? 'bg-[#D4AC0D] border-[#D4AC0D] text-black font-black' 
                                  : 'bg-black border-[#222] text-white/60 hover:border-white/20'
                              }`}
                            >
                              {size}x{size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-black/40 p-3 rounded-lg border border-[#222] text-[11px] text-white/70 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>빙고 크기:</span>
                        <strong className="text-white">{config.gridSize} x {config.gridSize}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>우승 조건:</span>
                        <strong className="text-[#D4AC0D]">{targetBingoRequired}줄 완성</strong>
                      </div>
                      {config.theme && (
                        <div className="flex justify-between border-t border-[#222] pt-1 mt-1">
                          <span>현재 주제:</span>
                          <strong className="text-[#D4AC0D] truncate max-w-[120px]">{config.theme}</strong>
                        </div>
                      )}
                    </div>

                    {isHost && stage === GameStage.LOBBY && (
                      <button
                        onClick={handleStartGameSequence}
                        className="w-full bg-[#600018] hover:bg-[#800020] text-white font-black py-3 px-4 rounded-xl border border-[#D4AC0D]/20 transition shadow-lg uppercase text-xs tracking-wider cursor-pointer"
                      >
                        게임 시작하기
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="bg-[#151515] border border-[#222] p-5 rounded-[12px] shadow-xl">
                  <h3 className="font-display font-bold text-xs text-white/60 mb-3 flex items-center space-x-2 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-[#D4AC0D]" />
                    <span>참여자 목록 ({players.length}명)</span>
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.map((p, idx) => {
                      const isMe = p.id === myPeerId;
                      return (
                        <div 
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition ${
                            isMe ? 'bg-[#600018]/15 border-[#D4AC0D]/30 pl-2' : 'bg-black/40 border-[#222]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-white/30 font-mono">#{idx + 1}</span>
                            <span className={`text-xs font-bold ${isMe ? 'text-[#D4AC0D]' : 'text-white/80'}`}>
                              {p.nickname}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {p.isHost && (
                              <span className="text-[8px] bg-[#600018] text-[#D4AC0D] border border-[#D4AC0D]/20 px-1.5 py-0.5 rounded flex items-center">
                                <Crown className="w-2 h-2 text-[#D4AC0D] mr-0.5" />
                                <span>방장</span>
                              </span>
                            )}
                            {stage === GameStage.BINGO_INPUT && (
                              <span className={`text-[8px] py-0.5 px-1.5 rounded uppercase font-bold ${
                                p.isReady ? 'bg-green-950/80 text-green-400 border border-green-905/40' : 'bg-[#222] text-white/40'
                              }`}>
                                {p.isReady ? 'READY' : 'INPUTTING'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                {stage === GameStage.LOBBY && (
                  <motion.div
                    key="lobby"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#151515] border border-[#222] p-6 rounded-[12px] shadow-2xl min-h-[360px] flex flex-col justify-between"
                  >
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-[#600018]/20 border border-[#D4AC0D]/30 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-all">
                        <Sword className="w-6 h-6 text-[#D4AC0D]" />
                      </div>
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">Speed Touch Bingo</h3>
                      <p className="text-white/60 text-xs max-w-md mx-auto mt-2 leading-relaxed">
                        순발력을 시험하는 터치 버튼 선점 승리제 실시간 P2P 빙고! 대주제가 도출되면 각자 단어를 채우고, 눈치싸움 선터치를 통해 빙고를 채웁니다.
                      </p>
                    </div>

                    <div className="border-t border-[#222] pt-4 text-center">
                      <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase block">
                        {!isConnected 
                          ? "사용자 이름을 정해 방을 개설하거나 친구의 방 코드로 연결하세요"
                          : isHost 
                            ? "친구들에게 좌측 방 코드를 전송하세요. 친구들이 입장하면 게임을 시작하세요!" 
                            : "방장이 게임을 시작할 때까지 잠시 대기해주세요..."}
                      </span>
                    </div>
                  </motion.div>
                )}

                {stage === GameStage.THEME_SELECT && (
                  <motion.div
                    key="theme"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#151515] border border-[#222] p-6 rounded-[12px] shadow-2xl min-h-[360px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="bg-[#600018]/30 text-white/95 px-3 py-1 rounded-xl inline-flex items-center space-x-1.5 text-[10px] font-bold border border-[#D4AC0D]/20 mb-4 select-none uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AC0D]" />
                        <span>주제 선정 진행 중</span>
                      </div>

                      {config.themeChooserId === myPeerId ? (
                        <div className="space-y-4 text-left">
                          <h3 className="font-display font-black text-lg text-[#D4AC0D] uppercase tracking-wide">💡 당신이 이번 주의 주제 선정자입니다!</h3>
                          <p className="text-white/70 text-xs leading-relaxed max-w-xl">
                            친구들과 함께 빙고판에 채워 넣을 중심 주제를 결정하고 입력해 주세요.<br/>
                            (예: 좋아하는 편의점 음식, 마티즈 색상, 자바스크립트 라이브러리 등)
                          </p>

                          <div className="pt-2 max-w-md">
                            <label className="block text-[10px] text-white/40 uppercase font-mono tracking-widest mb-1">빙고 대주제</label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                maxLength={30}
                                value={customThemeInput}
                                onChange={(e) => setCustomThemeInput(e.target.value)}
                                placeholder="원하는 주제 입력"
                                className="flex-1 bg-black border border-[#222] py-2 px-3.5 rounded-xl text-xs text-white placeholder-neutral-700 font-bold focus:outline-none focus:border-[#D4AC0D]"
                                id="custom-theme-input"
                              />
                              <button
                                onClick={handleConfirmTheme}
                                className="bg-[#600018] hover:bg-[#800020] border border-[#D4AC0D]/30 font-black text-white text-xs px-5 rounded-xl transition duration-150 cursor-pointer"
                              >
                                소집 확정
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center space-y-4">
                          <div className="w-10 h-10 border-2 border-[#D4AC0D] border-t-transparent rounded-full animate-spin mx-auto" />
                          <h4 className="font-display font-bold text-md text-white">
                            "{players.find(p => p.id === config.themeChooserId)?.nickname || '참가자'}" 님이 주제 지정 중입니다...
                          </h4>
                          <p className="text-white/40 text-xs">주제가 결정되면 실시간으로 각자의 빙고 판을 구상하게 됩니다. 잠시만 대기해 주세요.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {stage === GameStage.BINGO_INPUT && (
                  <motion.div
                    key="bingo-fill"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#151515] border border-[#222] p-5 rounded-[12px] shadow-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#222]">
                      <div className="text-left">
                        <span className="text-[9px] text-white/40 font-mono tracking-widest block uppercase">BINGO TOPIC CREATION</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] bg-[#600018] px-1.5 py-0.5 rounded text-[#D4AC0D] font-black tracking-tight border border-[#D4AC0D]/10">THEME</span>
                          <h4 className="font-display font-black text-md text-white">"{config.theme}"</h4>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 items-start sm:items-end">
                        <span className="text-[10px] text-white/40 font-bold">단어 자동 추천기:</span>
                        <div className="flex items-center space-x-1.5">
                          <select
                            value={selectedThemeCategory}
                            onChange={(e) => setSelectedThemeCategory(e.target.value as any)}
                            className="bg-black border border-[#222] rounded-lg text-[10px] py-1 px-1.5 text-white/80 focus:outline-none font-sans"
                            id="theme-select-dropdown"
                          >
                            <option value="general">자연 / 일상</option>
                            <option value="food">맛있는 한식/양식</option>
                            <option value="movie">영화 & 오락</option>
                            <option value="animals">귀여운 동물</option>
                            <option value="tech">IT 디바이스 & 소프트웨어</option>
                            <option value="fruits">새콤달콤 과일</option>
                          </select>
                          <button
                            onClick={handleAutoFillKeywords}
                            disabled={localIsReady}
                            className="bg-[#D4AC0D] hover:bg-[#e0b716] text-black font-extrabold text-[9px] py-1 px-2 rounded-lg transition border border-black/10 flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
                            id="auto-fill-btn"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>추천 로드</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 text-left">
                      <p className="text-[11px] text-white/60 mb-2">대주제 "{config.theme}"에 알맞은 단어들로 {config.gridSize * config.gridSize}개의 빙고 칸을 중복없이 기입하세요:</p>
                      
                      <div 
                        className="grid gap-2 bg-black/60 p-3 rounded-lg border border-[#222]"
                        style={{
                          gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`
                        }}
                      >
                        {localGrid.map((val, idx) => (
                          <div key={idx} className="relative">
                            <input
                              type="text"
                              value={val}
                              disabled={localIsReady}
                              onChange={(e) => {
                                const updated = [...localGrid];
                                updated[idx] = e.target.value;
                                setLocalGrid(updated);
                              }}
                              placeholder={`단어 #${idx + 1}`}
                              className="w-full bg-black/80 border border-[#222] py-2.5 px-1 text-center font-bold text-xs rounded-lg focus:border-[#600018] focus:outline-none text-white disabled:opacity-50 transition"
                              id={`word-input-${idx}`}
                            />
                            <span className="absolute bottom-0.5 right-1.5 text-[7px] text-white/25 font-mono">#{idx+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[#222]">
                      <span className="text-[10px] text-white/30 font-sans">모든 칸을 기입해야 매치에 입장합니다</span>
                      
                      <button
                        onClick={handleSubmitBingoGrid}
                        disabled={localIsReady}
                        className={`py-2 px-5 rounded-lg border border-black/30 font-black text-xs transition duration-150 cursor-pointer ${
                          localIsReady 
                            ? 'bg-[#222] text-white/30 pointer-events-none'
                            : 'bg-[#600018] text-white hover:bg-[#800020] hover:border-[#D4AC0D]/20'
                        }`}
                      >
                        {localIsReady ? '다른 플레이어 준비 완료 대기 중...' : '준비 완료 (키워드 확정)'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {stage === GameStage.END && (
                  <motion.div
                    key="end-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#151515] border border-[#222] p-6 rounded-[12px] shadow-2xl text-center max-w-md mx-auto py-8"
                  >
                    <div className="w-16 h-16 bg-[#600018]/10 border border-[#D4AC0D] rounded-full flex items-center justify-center mx-auto mb-4 hover:rotate-6 transition-all shadow-[0_0_15px_rgba(212,172,13,0.1)]">
                      <Trophy className="w-8 h-8 text-[#D4AC0D]" />
                    </div>

                    <span className="text-[9px] bg-[#600018] text-[#D4AC0D] px-2.5 py-0.5 rounded-full font-bold border border-[#D4AC0D]/20 inline-block mb-2 uppercase tracking-widest font-mono">
                      GRAND BINGO CHAMPION
                    </span>

                    <h3 className="font-display font-black text-xl text-white">축하합니다! 대국 종료</h3>
                    <p className="font-display font-black text-md text-[#D4AC0D] bg-black/60 border border-[#222] py-2 px-4 rounded-xl max-w-xs mx-auto mt-2 mb-4">
                       {winnerNickname || '참가자'}
                    </p>

                    {isHost ? (
                      <button
                        onClick={handleRestartNewRound}
                        className="bg-[#600018] hover:bg-[#800020] text-white font-extrabold py-2 px-5 rounded-xl border border-[#D4AC0D]/30 transition-all text-xs inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>대기실로 돌아가기</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-white/40 block font-mono italic">
                        방장이 새로운 대기실로 초기화할 때까지 대기하세요...
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Chat Console panel shown only on non-GAME_PLAY connected screens */}
              {isConnected && (
                <div className="bg-[#151515] border border-[#222] rounded-[12px] overflow-hidden flex flex-col h-44 mt-6">
                  <div className="bg-black/40 px-3 py-2 border-b border-[#222] flex justify-between items-center">
                    <span className="font-mono text-[10px] text-[#D4AC0D] font-bold flex items-center space-x-1 uppercase">
                      <Tv className="w-3 h-3 mr-1" />
                      <span>실시간 라이브 게임 콘솔 로그</span>
                    </span>
                  </div>

                  <div 
                    ref={logContainerRef}
                    className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[10px] bg-black/20 text-left"
                  >
                    {gameLogs.length === 0 ? (
                      <div className="text-white/20 italic text-center py-8 text-xs">라이브 게임 일지와 P2P 이벤트 패킷이 기록됩니다...</div>
                    ) : (
                      gameLogs.map((log) => (
                        <div key={log.id} className="text-white/70 leading-normal">
                          <span className="text-[#D4AC0D]/60 mr-1.5 font-bold">[{log.time}]</span>
                          <span>{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      <footer className="border-t border-[#222] bg-[#0d0d0d] py-5 px-4 mt-12 text-center text-[10px] text-white/30 font-mono flex flex-col sm:flex-row sm:justify-between sm:max-w-7xl sm:mx-auto sm:w-full items-center gap-2">
        <div>Speed Touch Bingo &copy; {new Date().getFullYear()}</div>
        <div className="text-[#D4AC0D] opacity-70">Peer P2P Real-time Collaboration Engine • v1.2.0 Bento Dark</div>
      </footer>

    </div>
  );
}
