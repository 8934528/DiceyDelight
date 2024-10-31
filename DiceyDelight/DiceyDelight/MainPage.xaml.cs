using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace DiceyDelight
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MainPage : ContentPage
    {
        public int CurrentHighestScore { get; private set; } = 0;
        public MainPage()
        {
            InitializeComponent();
            LoadHighestScore();
            UpdateHighestScoreLabel(CurrentHighestScore);
        }

        private void LoadHighestScore()
        {
            var app = Application.Current as App;
            if (app != null)
            {
                CurrentHighestScore = app.HighestScore; 
            }
        }

        private void OnEasyClicked(object sender, EventArgs e)
        {
            ValidateAndNavigate(60, "Easy");
        }

        private void OnIntermediateClicked(object sender, EventArgs e)
        {
            ValidateAndNavigate(40, "Intermediate");
        }

        private void OnHardClicked(object sender, EventArgs e)
        {
            ValidateAndNavigate(20, "Hard");
        }

        private void ValidateAndNavigate(int timerValue, string difficultyLevel)
        {
            if (string.IsNullOrWhiteSpace(NameInput.Text))
            {
                DisplayAlert("Validation Error", "Please enter your name", "OK");
            }
            else
            {
                string playerName = NameInput.Text.Trim();

                Navigation.PushAsync(new DicePlay(timerValue, playerName, difficultyLevel));
            }
        }

        public void UpdateHighestScoreLabel(int newScore)
        {
            CurrentHighestScore = newScore;
            HighestScoreLabel.Text = $"Highest Score: {CurrentHighestScore}";
        }

        public void UpdatePlayerScore(int playerScore, int highestScore)
        {
            HighestScoreLabel.Text = $"Highest Score: {highestScore}";
        }
        public void OnResetClicked(object sender, EventArgs e)
        {
            var app = Application.Current as App;

            if (app != null)
            {
                app.HighestScore = 0; 
                app.SaveHighestScore(); 
            }

            UpdateHighestScoreLabel(0); 
        }




    }
}