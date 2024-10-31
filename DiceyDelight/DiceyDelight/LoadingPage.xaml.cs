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
    public partial class LoadingPage : ContentPage
    {
        public LoadingPage()
        {
            InitializeComponent();
            SimulateLoading();
        }

        private async void SimulateLoading()
        {
            await Task.Delay(2000); 

            await Navigation.PushAsync(new MainPage());
        }
    }
}