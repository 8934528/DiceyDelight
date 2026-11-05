window.diceyApp = {
    navigate: function (dotNetHelper, route) {
        if (dotNetHelper) {
            try {
                dotNetHelper.invokeMethodAsync('NavigateTo', route);
                return;
            } catch (e) {
                console.warn('navigation failed', e);
            }
        }
        window.location.href = route;
    },

    splashTimer: null,
    splashFadeTimer: null,
    typewriterInterval: null,

    initSplash: function (dotNetHelper) {
        const titleElement = document.getElementById('splash-title');
        const splashPage = document.querySelector('.splash-page');
        const fullText = "Dicey Delight";

        function startTypewriter(text, el, charDelay) {
            if (!el) return;
            el.textContent = "";
            el.classList.add('typing');
            let index = 0;

            if (diceyApp.typewriterInterval) clearInterval(diceyApp.typewriterInterval);

            diceyApp.typewriterInterval = setInterval(() => {
                if (index < text.length) {
                    el.textContent += text.charAt(index);
                    index++;
                } else {
                    clearInterval(diceyApp.typewriterInterval);
                    diceyApp.typewriterInterval = null;
                    setTimeout(() => {
                        el.classList.remove('typing');
                    }, 400);
                }
            }, charDelay);
        }

        setTimeout(() => {
            startTypewriter(fullText, titleElement, 85);
        }, 120);

        const dropAndSettleTimeMs = 1600;
        const randomRestTimeMs = Math.floor(Math.random() * (4500 - 3000 + 1)) + 3000;
        const totalDurationBeforeRedirect = dropAndSettleTimeMs + randomRestTimeMs;

        diceyApp.splashFadeTimer = setTimeout(() => {
            if (splashPage) {
                splashPage.style.opacity = '0';
            }
        }, Math.max(0, totalDurationBeforeRedirect - 350));

        diceyApp.splashTimer = setTimeout(() => {
            diceyApp.navigate(dotNetHelper, 'home');
        }, totalDurationBeforeRedirect);
    },

    cleanupSplash: function () {
        if (diceyApp.typewriterInterval) {
            clearInterval(diceyApp.typewriterInterval);
            diceyApp.typewriterInterval = null;
        }
        if (diceyApp.splashFadeTimer) {
            clearTimeout(diceyApp.splashFadeTimer);
            diceyApp.splashFadeTimer = null;
        }
        if (diceyApp.splashTimer) {
            clearTimeout(diceyApp.splashTimer);
            diceyApp.splashTimer = null;
        }
    },

    initHome: function (dotNetHelper) {
        const modeSingle = document.getElementById('mode-single');
        const modeMulti = document.getElementById('mode-multi');
        const player2Wrapper = document.getElementById('player2-wrapper');
        const player1Input = document.getElementById('player1-name');
        const player2Input = document.getElementById('player2-name');
        const btnNext = document.getElementById('btn-next');
        const btnSoundToggle = document.getElementById('btn-sound-toggle-home');

        if (btnSoundToggle && window.diceySound) {
            btnSoundToggle.onclick = () => window.diceySound.toggleMute();
            window.diceySound.updateIcons();
        }

        if (!player1Input || !modeSingle || !btnNext) return;

        const savedP1 = localStorage.getItem('dicey_p1_name');
        if (savedP1) {
            player1Input.value = savedP1;
        }
        const savedP2 = localStorage.getItem('dicey_p2_name');
        if (savedP2 && player2Input) {
            player2Input.value = savedP2;
        }

        const savedMode = localStorage.getItem('dicey_mode') || 'single';
        if (savedMode === 'multi' && modeMulti) {
            modeMulti.checked = true;
            if (player2Wrapper) player2Wrapper.classList.add('player2-expanded');
        } else {
            modeSingle.checked = true;
            if (player2Wrapper) player2Wrapper.classList.remove('player2-expanded');
        }

        const savedDiff = localStorage.getItem('dicey_difficulty') || 'Easy';
        const diffRadio = document.querySelector(`input[name="difficulty"][value="${savedDiff}"]`);
        if (diffRadio) {
            diffRadio.checked = true;
        }

        function toggleP2(show) {
            if (!player2Wrapper) return;
            if (show) {
                player2Wrapper.classList.add('player2-expanded');
                if (player2Input) player2Input.focus();
            } else {
                player2Wrapper.classList.remove('player2-expanded');
            }
        }

        modeSingle.addEventListener('change', () => toggleP2(false));
        if (modeMulti) {
            modeMulti.addEventListener('change', () => toggleP2(true));
        }

        btnNext.addEventListener('click', () => {
            const p1 = player1Input.value.trim() || 'Player 1';
            const isMulti = modeMulti && modeMulti.checked;
            const p2 = isMulti ? ((player2Input && player2Input.value.trim()) || 'Player 2') : 'Computer';

            const selectedDiff = document.querySelector('input[name="difficulty"]:checked');
            const diffName = selectedDiff ? selectedDiff.value : 'Easy';

            localStorage.setItem('dicey_p1_name', p1);
            localStorage.setItem('dicey_p2_name', p2);
            localStorage.setItem('dicey_mode', isMulti ? 'multi' : 'single');
            localStorage.setItem('dicey_difficulty', diffName);

            diceyApp.navigate(dotNetHelper, 'start');
        });

        [player1Input, player2Input].forEach(input => {
            if (!input) return;
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    btnNext.click();
                }
            });
        });
    },

    gameState: null,

    initStart: async function (dotNetHelper) {
        diceyApp.cleanupStart();

        const btnRoll = document.getElementById('btn-roll');
        const labelSum = document.getElementById('label-sum');
        const labelD3 = document.getElementById('label-d3');

        const playArena = document.getElementById('play-arena');
        const diceRow = document.getElementById('dice-row');
        const actionRow = document.getElementById('action-row');

        const playerCardTop = document.getElementById('player-card-top');
        const playerCardBottom = document.getElementById('player-card-bottom');
        const circlesTop = document.getElementById('circles-top');
        const circlesBottom = document.getElementById('circles-bottom');

        const timerTop = document.getElementById('timer-top');
        const timerBottom = document.getElementById('timer-bottom');

        const displayNameTop = document.getElementById('display-name-top');
        const displayNameBottom = document.getElementById('display-name-bottom');
        const displayScoreTop = document.getElementById('display-score-top');
        const displayScoreBottom = document.getElementById('display-score-bottom');
        const headerLevel = document.getElementById('header-level');
        const headerHighScore = document.getElementById('header-high-score');
        const btnHeaderBack = document.getElementById('btn-header-back');
        const btnSoundToggle = document.getElementById('btn-sound-toggle');

        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalTopName = document.getElementById('modal-top-name');
        const modalTopDesc = document.getElementById('modal-top-desc');
        const modalBottomName = document.getElementById('modal-bottom-name');
        const modalP1Target = document.getElementById('modal-p1-target');
        const btnModalStart = document.getElementById('btn-modal-start');

        const gameOverBackdrop = document.getElementById('game-over-backdrop');
        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverWinnerName = document.getElementById('game-over-winner-name');
        const gameOverMessage = document.getElementById('game-over-message');
        const btnPlayAgain = document.getElementById('btn-play-again');
        const btnGameOverHome = document.getElementById('btn-game-over-home');

        const p1Name = localStorage.getItem('dicey_p1_name') || 'Player 1';
        const gameMode = localStorage.getItem('dicey_mode') || 'single';
        const p2Name = localStorage.getItem('dicey_p2_name') || (gameMode === 'single' ? 'Computer' : 'Player 2');
        const difficulty = localStorage.getItem('dicey_difficulty') || 'Easy';
        const savedHighScore = parseInt(localStorage.getItem('dicey_high_score'), 10) || 112;

        let snapshot = await dotNetHelper.invokeMethodAsync('InitGameInCSharp', p1Name, p2Name, gameMode, difficulty, savedHighScore);

        if (headerLevel) headerLevel.textContent = snapshot.difficulty;
        if (headerHighScore) headerHighScore.textContent = snapshot.highScore;
        if (displayNameBottom) displayNameBottom.textContent = snapshot.bottomPlayerName;
        if (displayNameTop) displayNameTop.textContent = snapshot.topPlayerName;
        if (displayScoreBottom) displayScoreBottom.textContent = "0";
        if (displayScoreTop) displayScoreTop.textContent = "0";

        if (modalTopName) modalTopName.textContent = snapshot.topPlayerName;
        if (modalTopDesc) modalTopDesc.textContent = snapshot.isComputerOpponent ? "Computer will be at the top" : `${snapshot.topPlayerName} is at the top`;
        if (modalBottomName) modalBottomName.textContent = snapshot.bottomPlayerName;
        if (modalP1Target) modalP1Target.textContent = snapshot.bottomPlayerName;

        if (btnHeaderBack) {
            btnHeaderBack.onclick = function () {
                diceyApp.navigate(dotNetHelper, 'home');
            };
        }

        if (btnSoundToggle && window.diceySound) {
            btnSoundToggle.onclick = () => window.diceySound.toggleMute();
            window.diceySound.updateIcons();
        }

        const faceAngles = [
            { x: 0, y: 0 },
            { x: -90, y: 0 },
            { x: 0, y: -90 },
            { x: 0, y: 90 },
            { x: 90, y: 0 },
            { x: 0, y: 180 }
        ];

        const state = {
            isAnimating: false,
            timerInterval: null,
            fireworksAnimationId: null,
            computerTimeoutId: null,
            currentTurn: snapshot.currentTurn,
            cubes: [
                { element: document.getElementById('d1'), spinsX: 0, spinsY: 0 },
                { element: document.getElementById('d2'), spinsX: 0, spinsY: 0 },
                { element: document.getElementById('d3'), spinsX: 0, spinsY: 0 }
            ]
        };

        diceyApp.gameState = state;

        function updateTimerBar(barEl, remainingSeconds) {
            if (!barEl) return;
            const fraction = Math.max(0, remainingSeconds / snapshot.totalTimeSeconds);
            const percentage = fraction * 100;
            barEl.style.width = `${percentage}%`;

            if (percentage <= 20) {
                barEl.style.backgroundColor = '#dc3545';
            } else if (percentage <= 45) {
                barEl.style.backgroundColor = '#ffc107';
            } else {
                barEl.style.backgroundColor = '#198754';
            }
        }

        function pauseTimer() {
            if (state.timerInterval) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
            }
        }

        function startTimer() {
            pauseTimer();
            state.timerInterval = setInterval(async () => {
                const tick = await dotNetHelper.invokeMethodAsync('TickTimerInCSharp', 0.1);
                updateTimerBar(timerBottom, tick.bottomRemaining);
                updateTimerBar(timerTop, tick.topRemaining);

                if (tick.isExpired) {
                    pauseTimer();
                    showGameOver("Time's Up!", tick.winnerName, tick.gameOverReason);
                }
            }, 100);
        }

        function showGameOver(title, winner, reason) {
            pauseTimer();
            if (btnRoll) btnRoll.disabled = true;
            if (window.diceySound) window.diceySound.playVictory();

            if (gameOverTitle) gameOverTitle.textContent = title;
            if (gameOverWinnerName) gameOverWinnerName.textContent = `${winner} Wins!`;
            if (gameOverMessage) gameOverMessage.textContent = reason;
            if (gameOverBackdrop) gameOverBackdrop.style.display = 'flex';
            startFireworks();
        }

        function removeCircle(circleEl) {
            if (!circleEl) return;
            circleEl.classList.add('circle-hiding');
            setTimeout(() => {
                circleEl.classList.remove('circle-hiding');
                circleEl.classList.add('circle-hidden');
            }, 250);
        }

        function restoreCircle(circleEl) {
            if (!circleEl) return;
            circleEl.classList.remove('circle-hidden');
            circleEl.classList.add('circle-restoring');
            setTimeout(() => {
                circleEl.classList.remove('circle-restoring');
            }, 350);
        }

        function switchTurnAnimation(nextTurn) {
            pauseTimer();
            state.currentTurn = nextTurn;

            if (actionRow) {
                actionRow.classList.add('row-hidden');
            }

            setTimeout(() => {
                if (playerCardTop) playerCardTop.classList.toggle('active-turn', nextTurn === 'top');
                if (playerCardBottom) playerCardBottom.classList.toggle('active-turn', nextTurn === 'bottom');

                if (diceRow && playArena) {
                    const firstRect = diceRow.getBoundingClientRect();
                    playArena.classList.toggle('top-player-turn', nextTurn === 'top');
                    const lastRect = diceRow.getBoundingClientRect();
                    const deltaY = firstRect.top - lastRect.top;

                    diceRow.style.transition = 'none';
                    diceRow.style.transform = `translateY(${deltaY}px)`;
                    diceRow.getBoundingClientRect();

                    diceRow.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                    diceRow.style.transform = 'translateY(0)';

                    setTimeout(() => {
                        diceRow.style.transition = '';
                        diceRow.style.transform = '';

                        if (actionRow) actionRow.classList.remove('row-hidden');
                        state.isAnimating = false;
                        startTimer();

                        if (nextTurn === 'top' && snapshot.isComputerOpponent) {
                            if (btnRoll) {
                                btnRoll.disabled = true;
                                btnRoll.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
                            }
                            state.computerTimeoutId = setTimeout(() => {
                                rollAllDice();
                            }, 1000);
                        } else {
                            if (btnRoll) {
                                btnRoll.disabled = false;
                                btnRoll.innerHTML = '<i class="bi bi-shuffle fs-4"></i>';
                            }
                        }
                    }, 300);
                }
            }, 200);
        }

        async function rollAllDice() {
            if (state.isAnimating) return;
            state.isAnimating = true;
            if (window.diceySound) window.diceySound.startDiceRoll();

            if (btnRoll) btnRoll.disabled = true;
            if (labelSum) labelSum.textContent = '-';
            if (labelD3) labelD3.textContent = '-';

            const rollResult = await dotNetHelper.invokeMethodAsync('RollDiceInCSharp');

            const faceIndices = [
                rollResult.die1 - 1,
                rollResult.die2 - 1,
                rollResult.die3Face - 1
            ];

            state.cubes.forEach((cube, idx) => {
                const faceIdx = faceIndices[idx];
                const angle = faceAngles[faceIdx];

                cube.spinsX += (Math.floor(Math.random() * 3) + 2) * 360;
                cube.spinsY += (Math.floor(Math.random() * 3) + 2) * 360;

                const targetX = cube.spinsX + angle.x;
                const targetY = cube.spinsY + angle.y;

                if (cube.element) {
                    cube.element.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
                }
            });

            setTimeout(async () => {
                if (labelSum) labelSum.textContent = rollResult.sum;
                if (labelD3) labelD3.textContent = rollResult.isStar ? '★' : '—';

                const turnRes = await dotNetHelper.invokeMethodAsync('ProcessTurnInCSharp', rollResult.die1, rollResult.die2, rollResult.die3Face);
                if (window.diceySound) {
                    window.diceySound.stopDiceRoll();
                    window.diceySound.playRollResult(turnRes, rollResult);
                }

                const activeCirclesCard = (state.currentTurn === 'bottom' ? circlesBottom : circlesTop);
                const opponentCirclesCard = (state.currentTurn === 'bottom' ? circlesTop : circlesBottom);

                let actionDelay = 350;

                if (turnRes.numberWasRemoved) {
                    const circleEl = activeCirclesCard ? activeCirclesCard.querySelector(`.num-circle[data-num="${turnRes.removedNumber}"]`) : null;
                    if (circleEl) {
                        removeCircle(circleEl);
                        actionDelay = 450;
                    }
                } else if (turnRes.restoredNumber) {
                    const circleEl = opponentCirclesCard ? opponentCirclesCard.querySelector(`.num-circle[data-num="${turnRes.restoredNumber}"]`) : null;
                    if (circleEl) {
                        restoreCircle(circleEl);
                        actionDelay = 500;
                    }
                }

                if (displayScoreBottom) displayScoreBottom.textContent = turnRes.bottomScore;
                if (displayScoreTop) displayScoreTop.textContent = turnRes.topScore;
                if (headerHighScore) headerHighScore.textContent = turnRes.highScore;
                localStorage.setItem('dicey_high_score', turnRes.highScore.toString());

                if (turnRes.isGameOver) {
                    setTimeout(() => showGameOver("Victory!", turnRes.winnerName, turnRes.gameOverReason), 300);
                    return;
                }

                setTimeout(() => {
                    switchTurnAnimation(turnRes.nextTurn);
                }, actionDelay);
            }, 1250);
        }

        function startFireworks() {
            const canvas = document.getElementById('fireworks-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const particles = [];
            const colors = ['#7c3aed', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];

            function createFirework(x, y) {
                const count = 38;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count;
                    const speed = Math.random() * 4.5 + 2;
                    particles.push({
                        x, y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        alpha: 1,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: Math.random() * 3 + 2,
                        decay: Math.random() * 0.016 + 0.014
                    });
                }
            }

            let lastLaunch = 0;
            function render(timestamp) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (timestamp - lastLaunch > 450) {
                    const rx = Math.random() * (canvas.width * 0.7) + (canvas.width * 0.15);
                    const ry = Math.random() * (canvas.height * 0.45) + (canvas.height * 0.15);
                    createFirework(rx, ry);
                    lastLaunch = timestamp;
                }

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.06;
                    p.vx *= 0.98;
                    p.alpha -= p.decay;

                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                    } else {
                        ctx.save();
                        ctx.globalAlpha = p.alpha;
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }

                state.fireworksAnimationId = requestAnimationFrame(render);
            }

            createFirework(canvas.width / 2, canvas.height / 3);
            state.fireworksAnimationId = requestAnimationFrame(render);
        }

        function stopFireworks() {
            if (state.fireworksAnimationId) {
                cancelAnimationFrame(state.fireworksAnimationId);
                state.fireworksAnimationId = null;
            }
            const canvas = document.getElementById('fireworks-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        if (btnRoll) {
            btnRoll.addEventListener('click', rollAllDice);
        }

        if (btnModalStart) {
            btnModalStart.addEventListener('click', async () => {
                if (window.diceySound) window.diceySound.playStartGame();
                if (modalBackdrop) {
                    modalBackdrop.classList.add('closing');
                    await dotNetHelper.invokeMethodAsync('StartGameInCSharp');
                    setTimeout(() => {
                        modalBackdrop.style.display = 'none';
                        if (playerCardBottom) playerCardBottom.classList.add('active-turn');
                        startTimer();
                    }, 220);
                }
            });
        }

        if (btnPlayAgain) {
            btnPlayAgain.addEventListener('click', () => {
                stopFireworks();
                diceyApp.navigate(dotNetHelper, 'start');
            });
        }

        if (btnGameOverHome) {
            btnGameOverHome.addEventListener('click', () => {
                stopFireworks();
                diceyApp.navigate(dotNetHelper, 'home');
            });
        }

        updateTimerBar(timerBottom, snapshot.totalTimeSeconds);
        updateTimerBar(timerTop, snapshot.totalTimeSeconds);
    },

    cleanupStart: function () {
        if (diceyApp.gameState) {
            if (diceyApp.gameState.timerInterval) {
                clearInterval(diceyApp.gameState.timerInterval);
            }
            if (diceyApp.gameState.computerTimeoutId) {
                clearTimeout(diceyApp.gameState.computerTimeoutId);
            }
            if (diceyApp.gameState.fireworksAnimationId) {
                cancelAnimationFrame(diceyApp.gameState.fireworksAnimationId);
            }
            diceyApp.gameState = null;
        }
    }
};
