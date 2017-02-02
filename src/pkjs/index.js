// Author: Ed Dam

// pebblejs
require('pebblejs');

// clayjs
var Clay       = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

// libraries
var UI       = require('pebblejs/ui');
var Vector2  = require('pebblejs/lib/vector2');
var ajax     = require('pebblejs/lib/ajax');
var Settings = require('pebblejs/settings');

// collect api data
var matchDay;
var token = 'fbaf269c163c46fe8f6fb73afa1e4a45';
//console.log('Saved apidata: ' + Settings.data('footballapi'));
collectmatchdayweek(collectapidata);

// definitions
var window = new UI.Window();
var windowSize = window.size();
var size = new Vector2(windowSize.x, windowSize.y);
var icon = 'images/football_icon.png';
var backgroundColor = 'black';
var highlightBackgroundColor = 'white';
var textColor = 'white';
var highlightTextColor = 'black';
var textAlign = 'center';
var fontLarge = 'gothic-28-bold';
var fontMedium = 'gothic-24-bold';
var fontSmall = 'gothic-18-bold';
var fontXSmall = 'gothic-14-bold';
//var style = 'small';
function position(height){
  return new Vector2(0, windowSize.y / 2 + height);
}

// main screen
var mainWind = new UI.Window();
var mainText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
var mainImage = new UI.Image({size: size});
mainText.position(position(-70));
mainImage.position(position(-65));
mainText.font(fontLarge);
mainText.text('FOOTBALL');
mainImage.image('images/splash.png');
mainWind.add(mainText);
mainWind.add(mainImage);
mainWind.show();

// up screen
mainWind.on('click', 'up', function(e) {
  var upWind = new UI.Window();
  var upHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var upText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  upHead.position(position(-35));
  upText.position(position(-3));
  upHead.font(fontLarge);
  upText.font(fontMedium);
  upHead.text('PremierLeague');
  upText.text('premierleague.com');
  upWind.add(upHead);
  upWind.add(upText);
  upWind.show();
});

// down screen
mainWind.on('click', 'down', function(e) {
  var downWind = new UI.Window();
  var downHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var downText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  downHead.position(position(-30));
  downText.position(position(-5));
  downHead.font(fontMedium);
  downText.font(fontSmall);
  downHead.text('Football v1.0');
  downText.text('by Edward Dam');
  downWind.add(downHead);
  downWind.add(downText);
  downWind.show();
});

// select button
mainWind.on('click', 'select', function(e) {

  // load collected api data
  var apidata = Settings.data('footballapi');
  //console.log('Loaded apidata: ' + apidata);
  
  // display menu
  var footballMenu = new UI.Menu({ //fullscreen: true,
    textColor: textColor, highlightBackgroundColor: highlightBackgroundColor,
    backgroundColor: backgroundColor, highlightTextColor: highlightTextColor,
    status: { separator: 'none', color: textColor, backgroundColor: backgroundColor }
  });
  footballMenu.section(0, { title: "Premier League" });
  for (var i = 0; i < apidata.length; i++) {
    var status = apidata[i].status;
    var time = apidata[i].date.substr(11, 5);
    var day = apidata[i].date.substr(8, 2);
    var month = apidata[i].date.substr(5, 2);
    var date = day + '/' + month + ' @' + time;
    var homeTeam = apidata[i].homeTeamName;
    var awayTeam = apidata[i].awayTeamName;
    if ( homeTeam === "West Ham United FC") {
      homeTeam = "WHU";
    } else if ( homeTeam === "West Bromwich Albion FC") {
      homeTeam = "WBA";
    } else if ( homeTeam === "Manchester City FC") {
      homeTeam = "MNC";
    } else if ( homeTeam === "Manchester United FC") {
      homeTeam = "MNU";
    } else {
      homeTeam = homeTeam.substr(0, 3).toUpperCase();
    }
    if ( awayTeam === "West Ham United FC") {
      awayTeam = "WHU";
    } else if ( awayTeam === "West Bromwich Albion FC") {
      awayTeam = "WBA";
    } else if ( awayTeam === "Manchester City FC") {
      awayTeam = "MNC";
    } else if ( awayTeam === "Manchester United FC") {
      awayTeam = "MNU";
    } else {
      awayTeam = awayTeam.substr(0, 3).toUpperCase();
    }
    var homeGoals = apidata[i].result.goalsHomeTeam;
    var awayGoals = apidata[i].result.goalsAwayTeam;
    var score = ' ' + homeGoals + '-' + awayGoals + ' ';
    var title = homeTeam + score + awayTeam;
    var subtitle = date;
    if (status === "FINISHED") {
      subtitle = "Full-Time";
    } else if (status === "IN_PLAY") {
      subtitle = "In-Play";
    } else {
      title = homeTeam + " vs " + awayTeam;
    }
    footballMenu.item(0, i, { icon: icon, title: title, subtitle: subtitle });
    window["matchText" + i] = title;
    window["matchInfo" + i] = subtitle;
  }
  footballMenu.show();
  mainWind.hide();

  footballMenu.on('select', function(e) {
    var matchWind = new UI.Window();
    var matchHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
    var matchText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
    var matchInfo = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
    matchHead.position(position(-45));
    matchText.position(position(-5));
    matchInfo.position(position(20));
    matchHead.font(fontLarge);
    matchText.font(fontMedium);
    matchInfo.font(fontXSmall);
    matchHead.text('Match');
    matchText.text(window["matchText" + e.itemIndex]);
    matchInfo.text(window["matchInfo" + e.itemIndex]);
    matchWind.add(matchHead);
    matchWind.add(matchText);
    matchWind.add(matchInfo);
    matchWind.show();
  });

});

// functions
function collectmatchdayweek(callback) {
  var url = 'http://api.football-data.org/v1/competitions/426';
  ajax({ url: url, headers: { 'X-Auth-Token': token }, type: 'json' },
    function(api){
      matchDay = api.currentMatchday;
      //console.log('Collected matchDay: ' + matchDay);
      callback();
    }
  );
}

function collectapidata() {
  var url = 'http://api.football-data.org/v1/competitions/426/fixtures';
  ajax({ url: url, headers: { 'X-Auth-Token': token }, type: 'json' },
    function(api){
      var apidata = api.fixtures.filter(function(val, index, array) {
        return val.matchday === matchDay;
      });
      //console.log('Collected apidata: ' + apidata);
      Settings.data('footballapi', apidata);
    }
  );
}