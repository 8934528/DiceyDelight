using System.Diagnostics.CodeAnalysis;

namespace DiceyDelight.Services
{
    [SuppressMessage("ReSharper", "UnusedMember.Global")]
    public class DiceGameEngine
    {
        private readonly Random _random = new();

        public PlayerState PlayerBottom { get; } = new();
        public PlayerState PlayerTop { get; } = new();
        public GameMode Mode { get; private set; } = GameMode.Single;
        public DifficultyLevel Difficulty { get; private set; } = DifficultyLevel.Easy;
        public string CurrentTurn { get; private set; } = "bottom";
        public int HighScore { get; private set; } = 112;
        public bool IsGameStarted { get; private set; }
        public bool IsGameOver { get; private set; }

        public GameSnapshot InitializeGame(string p1Name, string p2Name, string modeStr, string difficultyStr, int savedHighScore)
        {
            Mode = modeStr.Equals("multi", StringComparison.OrdinalIgnoreCase) ? GameMode.Multi : GameMode.Single;

            Difficulty = difficultyStr.ToLowerInvariant() switch
            {
                "hard" => DifficultyLevel.Hard,
                "median" or "intermediate" => DifficultyLevel.Median,
                _ => DifficultyLevel.Easy
            };

            int timeLimit = (int)Difficulty;
            HighScore = Math.Max(savedHighScore, 112);

            PlayerBottom.Reset(string.IsNullOrWhiteSpace(p1Name) ? "Player 1" : p1Name.Trim(), timeLimit);

            string secondPlayerDefault = Mode == GameMode.Single ? "Computer" : "Player 2";
            PlayerTop.Reset(string.IsNullOrWhiteSpace(p2Name) ? secondPlayerDefault : p2Name.Trim(), timeLimit);

            CurrentTurn = "bottom";
            IsGameStarted = false;
            IsGameOver = false;

            return new GameSnapshot
            {
                BottomPlayerName = PlayerBottom.Name,
                TopPlayerName = PlayerTop.Name,
                TotalTimeSeconds = timeLimit,
                HighScore = HighScore,
                Difficulty = Difficulty.ToString(),
                CurrentTurn = CurrentTurn,
                IsComputerOpponent = Mode == GameMode.Single
            };
        }

        public void StartGame()
        {
            IsGameStarted = true;
            IsGameOver = false;
        }

        public DiceRollResult RollDice()
        {
            return new DiceRollResult
            {
                Die1 = _random.Next(1, 7),
                Die2 = _random.Next(1, 7),
                Die3Face = _random.Next(1, 7)
            };
        }

        public TurnResult ProcessRoll(DiceRollResult roll)
        {
            var activePlayer = CurrentTurn == "bottom" ? PlayerBottom : PlayerTop;
            var opponent = CurrentTurn == "bottom" ? PlayerTop : PlayerBottom;

            var result = new TurnResult
            {
                Roll = roll
            };

            int sum = roll.Sum;

            if (!roll.IsStar)
            {
                if (!activePlayer.HasRemoved(sum))
                {
                    activePlayer.TryRemoveNumber(sum);
                    result.NumberWasRemoved = true;
                    result.RemovedNumber = sum;

                    activePlayer.Score = activePlayer.RemovedNumbers.Sum();
                    result.PointsAwarded = sum;

                    if (activePlayer.Score > HighScore)
                    {
                        HighScore = activePlayer.Score;
                    }

                    if (activePlayer.HasClearedAll())
                    {
                        IsGameOver = true;
                        result.IsGameOver = true;
                        result.WinnerName = activePlayer.Name;
                        result.GameOverReason = $"{activePlayer.Name} cleared all numbers first!";
                    }
                }
            }
            else
            {
                int? restored = opponent.RestoreHighestNumber();
                if (restored.HasValue)
                {
                    result.RestoredNumber = restored.Value;
                    opponent.Score = opponent.RemovedNumbers.Sum();
                }
            }

            result.BottomScore = PlayerBottom.Score;
            result.TopScore = PlayerTop.Score;
            result.HighScore = HighScore;

            if (!result.IsGameOver)
            {
                CurrentTurn = CurrentTurn == "bottom" ? "top" : "bottom";
            }
            result.NextTurn = CurrentTurn;

            return result;
        }

        public TimerTickResult TickTimer(double deltaSeconds)
        {
            var active = CurrentTurn == "bottom" ? PlayerBottom : PlayerTop;
            var other = CurrentTurn == "bottom" ? PlayerTop : PlayerBottom;

            active.RemainingTimeSeconds = Math.Max(0, active.RemainingTimeSeconds - deltaSeconds);

            bool isExpired = active.RemainingTimeSeconds <= 0;
            if (isExpired)
            {
                IsGameOver = true;
            }

            return new TimerTickResult
            {
                ActiveSide = CurrentTurn,
                BottomRemaining = PlayerBottom.RemainingTimeSeconds,
                TopRemaining = PlayerTop.RemainingTimeSeconds,
                IsExpired = isExpired,
                WinnerName = isExpired ? other.Name : null,
                GameOverReason = isExpired ? $"{active.Name}'s timer ran out first!" : null
            };
        }
    }
}
