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
    public partial class CustomAlertPage : ContentPage
    {
        public CustomAlertPage(string message, string imageName)
        {
            var alertImage = new Image
            {
                Source = ImageSource.FromFile(imageName),
                HorizontalOptions = LayoutOptions.Center,
                HeightRequest = 200 
            };

            var alertMessage = new Label
            {
                Text = message,
                FontSize = 20,
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
                TextColor = Color.Black,
                Margin = new Thickness(20)
            };

            var okButton = new Button
            {
                Text = "New Game",
                FontSize = Device.GetNamedSize(NamedSize.Medium, typeof(Button)),
                BackgroundColor = Color.FromHex("#FF4C4C"),
                TextColor = Color.White,
                CornerRadius = 10,
                WidthRequest = 150,
                HorizontalOptions = LayoutOptions.Center
            };
            okButton.Clicked += OnOkButtonClicked;

            Content = new StackLayout
            {
                Children = { alertImage, alertMessage, okButton },
                Padding = new Thickness(10),
                VerticalOptions = LayoutOptions.CenterAndExpand
            };
        }

        private void OnOkButtonClicked(object sender, EventArgs e)
        {
            Application.Current.MainPage = new NavigationPage(new MainPage());
        }
    }
}