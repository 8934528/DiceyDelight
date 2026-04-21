using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace DiceyDelight
{
    public partial class App : Application
    {
        private const string HighestScoreKey = "HighestScore";
        public int HighestScore { get; set; }

        public App()
        {
            InitializeComponent();
            MainPage = new NavigationPage(new LoadingPage()) 
            { 
                BarBackgroundColor = Color.FromHex("#FF4C4C"),
                BarTextColor = Color.White
            };
            HighestScore = 0;
        }

        protected override void OnStart() => LoadHighestScore();
        protected override void OnSleep() => SaveHighestScore();
        protected override void OnResume() => LoadHighestScore();

        public void LoadHighestScore()
        {
            if (Properties.ContainsKey(HighestScoreKey))
            {
                HighestScore = (int)Properties[HighestScoreKey];
                if (MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                    mainPage.UpdateHighestScoreLabel(HighestScore);
            }
        }

        public async void SaveHighestScore()
        {
            Properties[HighestScoreKey] = HighestScore;
            await SavePropertiesAsync();
        }
    }
}
