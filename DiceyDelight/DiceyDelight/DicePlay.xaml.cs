using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace DiceyDelight
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DicePlay : ContentPage
    {
        private Random random = new Random();
        private ThreeDie threeDie;

        private string playerName;
        private string difficultyLevel;

        private int playerScore = 0;
        private int computerScore = 0;

        private List<int> playerRemovedNumbers = new List<int>();
        private List<int> computerRemovedNumbers = new List<int>(); 

        private bool isPlayerTurn = true; // Track whose turn it is

        private TimerCountDown playerTimer;
        private TimerCountDown computerTimer;

        public DicePlay(int timerValue, string name, string difficultyLevel)
        {
            InitializeComponent();

            playerName = name;
            PlayerNameLabel.Text = playerName;

            // Display difficulty level
            this.difficultyLevel = difficultyLevel;            
            DifficultyLevelDisplay.Text = "Difficulty: " + difficultyLevel;

            // Initialize the timer
            playerTimer = new TimerCountDown(timerValue);
            playerTimer.TimeUpdated += UpdatePlayerTimerLabel;
            playerTimer.TimeExpired += OnPlayerTimerExpired;

            computerTimer = new TimerCountDown(timerValue);
            computerTimer.TimeUpdated += UpdateComputerTimerLabel; 
            computerTimer.TimeExpired += OnComputerTimerExpired;

            PlayerTimerLabel.Text = "Timer: " + timerValue; 
            ComputerTimerLabel.Text = "Timer: " + timerValue;

            // Set the highest score display from App
            App app = (App)Application.Current;
            HighestScoreDisplay.Text = "Highest Score: " + app.HighestScore;

            AddNumberBoxes(NumberBoxesGrid); // For computer
            AddNumberBoxes(PlayerNumberBoxesGrid); // For player

            threeDie = new ThreeDie();
            UpdateTurnIndicator(isPlayerTurn);
        }

        private void AddNumberBoxes(Grid targetGrid)
        {
            for (int i = 2; i <= 12; i++)
            {
                NumberBox numberBox = new NumberBox(i.ToString());
                int columnIndex = (i - 2) % 6;
                int rowIndex = (i - 2) / 6;
                targetGrid.Children.Add(numberBox, columnIndex, rowIndex);
            }
        }

        private async void RollButton_Clicked(object sender, EventArgs e)
        {
            if (isPlayerTurn)
            {
                playerTimer.Start();
                await PlayerTurn();
                playerTimer.Pause();

                if (CheckForWin(playerRemovedNumbers)) return;

                isPlayerTurn = false;
                UpdateTurnIndicator(isPlayerTurn);
                computerTimer.Start();

                int delayTime = random.Next(2000, 3001);
                await Task.Delay(delayTime);

                await ComputerTurn();
                computerTimer.Pause();

                if (CheckForWin(computerRemovedNumbers)) return;

                playerTimer.Resume();
            }
        }

        private async Task RotateDiceBox(StackLayout diceBox)
        {
            await diceBox.RotateTo(360, 500, Easing.CubicInOut);
            diceBox.Rotation = 0;
        }

        private async Task<int> PlayerTurn()
        {
            playerScore = await RollDiceAndHandleResults(PlayerNumberBoxesGrid, playerScore, playerRemovedNumbers, PlayerScoreLabel, NumberBoxesGrid, computerRemovedNumbers);
            return playerScore;
        }

        private async Task<int> ComputerTurn()
        {
            computerScore = await RollDiceAndHandleResults(NumberBoxesGrid, computerScore, computerRemovedNumbers, ComputerScoreLabel, PlayerNumberBoxesGrid, playerRemovedNumbers);
            isPlayerTurn = true;
            UpdateTurnIndicator(isPlayerTurn);
            return computerScore;
        }

        private bool CheckForWin(List<int> removedNumbers)
        {
            if (removedNumbers.Count == 11)
            {
                App app = (App)Application.Current;

                if (isPlayerTurn)
                {
                    if (playerScore > app.HighestScore)
                    {
                        app.HighestScore = playerScore;
                    }

                    // Display the alert for player's win
                    Device.BeginInvokeOnMainThread(async () =>
                    {
                        var alertPage = new CustomAlertPage(
                            $"{playerName} has won!\n{playerName} Score: {playerScore}\nComputer Score: {computerScore}\nHighest Score: {app.HighestScore}",
                            "congrats.png"  
                        );
                        await Navigation.PushModalAsync(alertPage);

                        UpdateHighestScoreDisplay(app.HighestScore);

                        await Navigation.PopToRootAsync();
                        if (Application.Current.MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                        {
                            mainPage.UpdatePlayerScore(playerScore, app.HighestScore);
                        }
                    });
                }
                else
                {
                    Device.BeginInvokeOnMainThread(async () =>
                    {
                        var alertPage = new CustomAlertPage(
                            $"Computer has won!\nComputer Score: {computerScore}\n{playerName}'s Score: {playerScore}",
                            "gameover.png"  
                        );
                        await Navigation.PushModalAsync(alertPage);

                        UpdateHighestScoreDisplay(app.HighestScore);

                        await Navigation.PopToRootAsync();
                        if (Application.Current.MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                        {
                            mainPage.UpdatePlayerScore(playerScore, app.HighestScore);
                        }
                    });
                }

                return true;
            }

            return false;
        }


        // Calculate the current score based on removed boxes
        private int CalculateScore(List<int> removedNumbers)
        {
            return removedNumbers.Sum();
        }

        private void UpdateHighestScoreDisplay(int highestScore)
        {
            Device.BeginInvokeOnMainThread(() =>
            {
                HighestScoreDisplay.Text = "Highest Score: " + highestScore;
            });
        }

        private async Task<int> RollDiceAndHandleResults(Grid targetGrid, int score, List<int> removedNumbers, Label scoreLabel, Grid opposingGrid, List<int> opposingRemovedNumbers)
        {
            Task rotateDice1Task = RotateDiceBox(DiceBox1);
            Task rotateDice2Task = RotateDiceBox(DiceBox2);
            Task rotateDice3Task = RotateDiceBox(DiceBox3);

            await Task.WhenAll(rotateDice1Task, rotateDice2Task, rotateDice3Task);

            int dice1Value = random.Next(1, 7);
            int dice2Value = random.Next(1, 7);
            bool showStar = random.Next(0, 100) < 5; 

            threeDie.DisplayDice(DiceBox1, dice1Value);
            threeDie.DisplayDice(DiceBox2, dice2Value);
            threeDie.DisplayStarOrBlank(DiceBox3, showStar);

            int sum = dice1Value + dice2Value;

            if (!showStar)
            {
                RemoveNumberBox(targetGrid, sum, removedNumbers);
            }
            else
            {
                if (opposingRemovedNumbers.Count > 0)
                {
                    int highestRemoved = opposingRemovedNumbers.Max();

                    score -= highestRemoved;
                    opposingRemovedNumbers.Remove(highestRemoved);

                    // Restore the highest number back to the opponent's grid
                    NumberBox restoredBox = new NumberBox(highestRemoved.ToString());
                    int columnIndex = (highestRemoved - 2) % 6;
                    int rowIndex = (highestRemoved - 2) / 6;
                    opposingGrid.Children.Add(restoredBox, columnIndex, rowIndex);
                }
            }

            score = CalculateScore(removedNumbers);
            scoreLabel.Text = "Current Score: " + score;

            return score;
        }

        private void RemoveNumberBox(Grid targetGrid, int numberToRemove, List<int> removedNumbers)
        {
            foreach (var child in targetGrid.Children.ToList())
            {
                if (child is NumberBox numberBox && numberBox.Children[0] is Label label && label.Text == numberToRemove.ToString())
                {
                    targetGrid.Children.Remove(numberBox);
                    removedNumbers.Add(numberToRemove);
                    break;
                }
            }
        }

        private void RestoreHighestNumberBox(Grid targetGrid, List<int> removedNumbers)
        {
            int highestRemoved = removedNumbers.Max();
            removedNumbers.Remove(highestRemoved);

            NumberBox restoredBox = new NumberBox(highestRemoved.ToString());
            int columnIndex = (highestRemoved - 2) % 6;
            int rowIndex = (highestRemoved - 2) / 6;
            targetGrid.Children.Add(restoredBox, columnIndex, rowIndex);
        }

        private void UpdateTurnIndicator(bool isPlayerTurn)
        {
            if (isPlayerTurn)
            {
                PlayerTurnIndicator.BackgroundColor = Color.FromHex("#FF4C4C");
                ComputerTurnIndicator.BackgroundColor = Color.Transparent;

                PlayerTimerLabel.TextColor = Color.FromHex("#FF4C4C");
                ComputerTimerLabel.TextColor = Color.Black;

                PlayerScoreLabel.TextColor = Color.FromHex("#FF4C4C");
                ComputerScoreLabel.TextColor = Color.Black;

                PlayerNameLabel.TextColor = Color.FromHex("#FF4C4C");
                ComputerNameLabel.TextColor = Color.Black;
            }
            else
            {
                ComputerTurnIndicator.BackgroundColor = Color.FromHex("#FF4C4C");
                PlayerTurnIndicator.BackgroundColor = Color.Transparent;

                ComputerTimerLabel.TextColor = Color.FromHex("#FF4C4C");
                PlayerTimerLabel.TextColor = Color.Black;

                ComputerScoreLabel.TextColor = Color.FromHex("#FF4C4C");
                PlayerScoreLabel.TextColor = Color.Black;

                ComputerNameLabel.TextColor = Color.FromHex("#FF4C4C");
                PlayerNameLabel.TextColor = Color.Black;
            }
        }

        //Player side when timer expires
        private void UpdatePlayerTimerLabel()
        {
            Device.BeginInvokeOnMainThread(() =>
            {
                PlayerTimerLabel.Text = "Timer: " + playerTimer.GetTimeRemaining();
            });
        }

        private void OnPlayerTimerExpired()
        {
            Device.BeginInvokeOnMainThread(async () =>
            {
                PlayerTimerLabel.Text = "Timer: 0";
                
                var alertPage = new CustomAlertPage(
                    "Game Over! Computer has won.\nComputer's Score: " + computerScore + "\n" + playerName + " lost.",
                    "gameover.png" 
                );
                await Navigation.PushModalAsync(alertPage);

                App app = (App)Application.Current;
                app.HighestScore = Math.Max(app.HighestScore, computerScore);
                UpdateHighestScoreDisplay(app.HighestScore);

                await Navigation.PopToRootAsync();

                if (Application.Current.MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                {
                    mainPage.UpdatePlayerScore(0, app.HighestScore);
                }
            });
        }

        //Computer Side when timer expires
        private void UpdateComputerTimerLabel()
        {
            Device.BeginInvokeOnMainThread(() =>
            {
                ComputerTimerLabel.Text = "Timer: " + computerTimer.GetTimeRemaining();
            });
        }

        private void OnResetClicked(object sender, EventArgs e)
        {
            if (Application.Current.MainPage is NavigationPage navPage &&
                navPage.CurrentPage is MainPage mainPage)
            {
                mainPage.OnResetClicked(sender, e); 
            }
        }

        private void OnComputerTimerExpired()
        {
            Device.BeginInvokeOnMainThread(async () =>
            {
                ComputerTimerLabel.Text = "Timer: 0";

                var alertPage = new CustomAlertPage(
                    "Congratulations! " + playerName + " won!\n" + playerName + "'s Score: " + playerScore + "\nComputer's Score: " + computerScore,
                    "congrats.png" 
                );
                await Navigation.PushModalAsync(alertPage);

                App app = (App)Application.Current;
                app.HighestScore = Math.Max(app.HighestScore, playerScore);
                UpdateHighestScoreDisplay(app.HighestScore);

                await Navigation.PopToRootAsync();

                if (Application.Current.MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                {
                    mainPage.UpdatePlayerScore(playerScore, app.HighestScore);
                }
            });
        }
    }
}