google.charts.load('current', {'packages':['corechart']}); <!-- load the visualization api -->
var heroes
var rad_tower,dir_tower;
var brad;var bdir;
function n(n){
return n > 9 ? "" + n: "0" + n;
}

function displayScoreBoard(match){
  document.getElementById('radiant-score').innerHTML = match.scoreboard.radiant.score;
  document.getElementById('dire-score').innerHTML = match.scoreboard.dire.score;
}

function onloadFunc(){
  var matchString = sessionStorage.match;
  var match = JSON.parse(matchString);
  heroes = JSON.parse(sessionStorage.heroes);
  //post request to predictor
  var xhr = new XMLHttpRequest();
  xhr.open("POST","predict", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(matchString)
  xhr.onload = function(){
  var result = xhr.responseText;
  result= JSON.parse(result);
   //result= JSON.parse(result);
  console.log(result);
  var htmlString = "";
  displayScoreBoard(match);
  if(match.scoreboard.duration < 120)
  {
    htmlString += "<h3>The match duration is less than 2 mins. Try again later.</h3>"
    document.getElementById('toggleteamindividual').style.display = 'none';
  }else{
      rad_tower=match.scoreboard.radiant.tower_state;
      dir_tower=match.scoreboard.dire.tower_state;

    var predict_result = "<h3>Prediction probablity for Radiant : "+ result["prediction_probablity"]["radiant_probablity"].toFixed(3)+"</h3>";
    predict_result += "<h3> Prediction probablity for Dire :"+ result["prediction_probablity"]["dire_probablity"].toFixed(3)+"</h3>";
    predict_result += "<h3> Prediction accuracy is : "+result["global_prediction_accuracy"].toFixed(3)+"</h3>";
    predict_result += "<h3> Predicted Winner is : "+result["prediction"]+"</h3>";
        //predict_result +="<h1>radiant tower state is"+rad_tower;
    document.getElementById("prediction").innerHTML = predict_result;
    htmlString += "<h3>The match duration is " + n(Math.floor(match.scoreboard.duration/60)) + ":" + n(Math.floor(((match.scoreboard.duration/60)%1) * 60)) + "</h3>";
    //htmlString += "<h3>The Score of Radiant:Dire is " + match.scoreboard.radiant.score + " : " + match.scoreboard.dire.score + "</h3>";

    htmlString += "<h3>Networth of Radiant:Dire is ";

    var netWorthRadiant = 0;
    var netWorthDire = 0;
    var netWorthRArr = [];
		var netWorthDArr = [];
    for(var i = 0;i < 5;i++){
      netWorthRadiant += match.scoreboard.radiant.players[i].net_worth;
      netWorthDire += match.scoreboard.dire.players[i].net_worth;
      netWorthRArr[i] = match.scoreboard.radiant.players[i].net_worth;
			netWorthDArr[i] = match.scoreboard.dire.players[i].net_worth;
    }

    htmlString +=  netWorthRadiant + " : " + netWorthDire;
     rad_tower=match.scoreboard.radiant.tower_state;
     dir_tower=match.scoreboard.dire.tower_state;
     //htmlString +="<h3>radiant t stats:</h3>"+rad_tower;
    barGraph(netWorthRadiant,netWorthDire,netWorthRArr,netWorthDArr);
    drawmap();
    }
    document.getElementById("match_details").innerHTML = htmlString  + "</h3>";
  }
};



function barGraph(netWorthRadiant,netWorthDire,netWorthRArr,netWorthDArr){
  var toggleteamindividual = document.getElementById('toggleteamindividual');

  var data1 = google.visualization.arrayToDataTable([
      ['Team', 'Player 1',{ role: 'style' }, 'Player 2',{ role: 'style' }, 'Player 3',{ role: 'style' }, 'Player 4',{ role: 'style' },'Player 5', { role: 'style' }],
      ['Radiant', netWorthRArr[0],'opacity:0.8',netWorthRArr[1],'opacity:0.8', netWorthRArr[2],'opacity:0.8', netWorthRArr[3],'opacity:0.8',netWorthRArr[4], 'opacity:0.8'],
      ['Dire', netWorthDArr[0],'opacity:0.8', netWorthDArr[1],'opacity:0.8',netWorthDArr[2],'opacity:0.8',netWorthDArr[3],'opacity:0.8',netWorthDArr[4], 'opacity:0.8'],
   ]);

   var data2 = google.visualization.arrayToDataTable([
     ['Team', 'Net Worth',{ role: 'style' }],
     ['Radiant', netWorthRadiant,'opacity:0.8; color: #00ff00;'],
     ['Dire', netWorthDire,'opacity:0.8; color: #ff0000;'],
   ]);

   var options = {
      title: "Net Worth of Each Player",
      width: 680,
      height: 400,
      bar: {groupWidth: "45%"},
      legend : {position: "bottom", textStyle: { color: 'white' } },
      titleTextStyle:{ color : 'white'},
      vAxis: {title:'Team',  titleTextStyle: { color: 'white'} , textStyle: { color: 'white'} },
      hAxis: {title:'Net Worth',minValue: 0  , titleTextStyle: { color: 'white'}, textStyle: { color: 'white'} },
      isStacked: 'absolute',
      backgroundColor: 'black',
      chartArea: {
                    backgroundColor: {
                           stroke: 'white',
                             strokeWidth: 3
                      }
                  },

     animation: {"startup": true , easing: 'out', duration: 1000,}
       };

    var chart = new google.visualization.BarChart(document.getElementById('chart'));

    google.charts.setOnLoadCallback(drawChart); <!-- setting callback -->
    function drawChart(){
   /* var data = google.visualization.arrayToDataTable([
       ['Team', 'this color needs to change', { role: 'style' },  { role: 'annotation' }],
       ['Radiant', netWorthRadiant, 'color:green ; opacity:0.8',netWorthRadiant],
       ['Dire', netWorthDire, 'color:red ; opacity:0.8', netWorthDire ],
    ]); */

      toggleteamindividual.disabled = true;
      google.visualization.events.addListener(chart, 'ready',
        function() {
          toggleteamindividual.disabled = false;
          toggleteamindividual.innerHTML = 'Switch to ' + (options.title == "Net Worth of Each Player" ? 'Team' : 'Players');
        });

    chart.draw(data1, options);
    }

      toggleteamindividual.onclick = function(){
        if(options.title == "Net Worth of Each Player"){
          options.title = "Net Worth of Teams";
          options.legend = {position: 'none'};
          options.animation = {"startup": true , easing: 'in', duration: 1000,};
          chart.draw(data2, options);
        }else{
          options.title = "Net Worth of Each Player";
          options.legend = {position: 'bottom'};
          chart.draw(data1, options);
        }
      }

  }
function drawmap()
{
  try{
    bdir=dir_tower.toString(2).split('');
    brad=rad_tower.toString(2).split('');
  }catch(e){console.log("Error");}
  var str='';
  str+="<h3>Tower status";
  str1="";
  //str1+='<img src="http://genr8rs.com/static/images/Generator/Dota2/MinimapConfigGenerator/minimap.jpg" alt="Dota2 minimap">';
  var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        var imageObj = new Image();

        imageObj.onload = function() {
          context.drawImage(imageObj, 150, 50);
        };
      //  imageObj.src = 'http://genr8rs.com/static/images/Generator/Dota2/MinimapConfigGenerator/minimap.jpg';
      /*  var c = document.getElementById("myCanvas");
        var c=document.getElementById("myCanvas");
        var ctx=c.getContext("2d");
        ctx.fillStyle="#FF0000";
        ctx.fillRect(220,40,10,10);*/
        function loadImages(sources, callback) {
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  for(var src in sources) {
    numImages++;
  }
  for(var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = sources[src];
  }
}
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var sources = {
  darthVader: 'http://genr8rs.com/static/images/Generator/Dota2/MinimapConfigGenerator/minimap.jpg',
  yoda: 'http://www.html5canvastutorials.com/demos/assets/yoda.jpg'
};

loadImages(sources, function(images) {
  context.drawImage(images.darthVader, 100, 30, 400, 400);
  context.drawImage(images.yoda, 170, 63, 10, 10);//top dire 1
  context.drawImage(images.yoda, 270, 63, 10, 10);//top dire 2
  context.drawImage(images.yoda, 397, 69, 10, 10);//top dire 3
  context.drawImage(images.yoda, 410, 129, 10, 10);//mid dire 3
  context.drawImage(images.yoda, 370, 169, 10, 10);//mid dire 2
  context.drawImage(images.yoda, 327, 217, 10, 10);//mid dire 1
});
}
