namespace DiceyDelight.Services
{
    public enum GameMode
    {
        Single,
        Multi
    }

    public enum DifficultyLevel
    {
        Easy = 120,
        Median = 60,
        Hard = 30
    }

    public class PlayerState
    {
        public string Name { get; set; } = "Player";
        public int Score { get; set; }
        public double RemainingTimeSeconds { get; set; } = 120;
        public HashSet<int> RemovedNumbers { get; } = [];

        public bool HasRemoved(int number) => RemovedNumbers.Contains(number);

        public bool TryRemoveNumber(int number)
        {
            if (number < 2 || number > 12) return false;
            return RemovedNumbers.Add(number);
        }

        public int? RestoreHighestNumber()
        {
            if (RemovedNumbers.Count == 0) return null;
            int highest = RemovedNumbers.Max();
            RemovedNumbers.Remove(highest);
            return highest;
        }

        public bool HasClearedAll() => RemovedNumbers.Count == 11;

        public void Reset(string name, double timeSeconds)
        {
            Name = name;
            Score = 0;
            RemainingTimeSeconds = timeSeconds;
            RemovedNumbers.Clear();
        }
    }

    public class DiceRollResult
    {
        public int Die1 { get; set; } = 1;
        public int Die2 { get; set; } = 1;
        public int Die3Face { get; set; } = 1;
        public bool IsStar => Die3Face == 1;
        public int Sum => Die1 + Die2;
    }

    public class TurnResult
    {
        public DiceRollResult Roll { get; set; } = new();
        public bool NumberWasRemoved { get; set; }
        public int? RemovedNumber { get; set; }
        public int? RestoredNumber { get; set; }
        public int PointsAwarded { get; set; }
        public int BottomScore { get; set; }
        public int TopScore { get; set; }
        public int HighScore { get; set; }
        public string NextTurn { get; set; } = "bottom";
        public bool IsGameOver { get; set; }
        public string? WinnerName { get; set; }
        public string? GameOverReason { get; set; }
    }

    public class GameSnapshot
    {
        public string BottomPlayerName { get; set; } = "";
        public string TopPlayerName { get; set; } = "";
        public double TotalTimeSeconds { get; set; }
        public int HighScore { get; set; }
        public string Difficulty { get; set; } = "Easy";
        public string CurrentTurn { get; set; } = "bottom";
        public bool IsComputerOpponent { get; set; }
    }

    public class TimerTickResult
    {
        public string ActiveSide { get; set; } = "bottom";
        public double BottomRemaining { get; set; }
        public double TopRemaining { get; set; }
        public bool IsExpired { get; set; }
        public string? WinnerName { get; set; }
        public string? GameOverReason { get; set; }
    }
}
