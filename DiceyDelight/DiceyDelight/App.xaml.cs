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
            MainPage = new NavigationPage(new LoadingPage()); 
            HighestScore = 0; 
        }

        protected override void OnStart()
        {
            LoadHighestScore();
        }

        protected override void OnSleep()
        {
            SaveHighestScore();
        }

        protected override void OnResume()
        {
            LoadHighestScore();
        }

        public void LoadHighestScore()
        {
            if (Application.Current.Properties.ContainsKey(HighestScoreKey))
            {
                HighestScore = (int)Application.Current.Properties[HighestScoreKey];

                if (Application.Current.MainPage is NavigationPage navPage && navPage.CurrentPage is MainPage mainPage)
                {
                    mainPage.UpdateHighestScoreLabel(HighestScore);
                }
            }
        }

        public async void SaveHighestScore()
        {
            Application.Current.Properties[HighestScoreKey] = HighestScore;
            await Application.Current.SavePropertiesAsync();
        }
    }
}
