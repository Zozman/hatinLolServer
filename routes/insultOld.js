var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

var apiKey = "8f05ad5c-5cf8-4816-abae-4f12c99ed131";

/* GET users listing. */
router.get('/', function(req, res) {
  var region = req.query.region;
  var charName = req.query.charName;
  request(makeIDURL(charName, region), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      var jsonObj = JSON.parse(body);
      var charID = String(jsonObj[charName.toLowerCase()].id);
      //res.json({ result: charID });
      request(makeSummaryURL(charID, region), function (error2, response2, body2) {
        if (!error2 && response2.statusCode == 200) {
          //console.log(body); // Print the google web page.
          //res.json({ result: charID });
          var aggArray = [];
          JSON.parse(body2).playerStatSummaries.forEach(function(item, index) {
            var wins = 0;
            var losses = 0;
            if (item.hasOwnProperty('wins')) {
              wins = item.wins;
            }
            if (item.hasOwnProperty('losses')) {
              losses = item.losses;
            }
            aggArray.push(new AggregatedStats().fromJson(item.aggregatedStats, wins, losses));
          });
          request(makeRankedURL(charID, region), function (error3, response3, body3) {
            if (!error3 && response3.statusCode == 200) {
              JSON.parse(body3).champions.forEach(function(item, index) {
                if (item.id === 0) {
                  aggArray.push(new AggregatedStats().fromJson(item.stats, 0, 0));
                }
              });
              res.json({ result: generateInsult(aggArray, charName), summoner:charName});
            } else {
              res.json({ result: generateInsult(aggArray, charName), summoner:charName});
            }
          })
          //res.json({result:String(aggArray[0].wins)});
        } else if (response.statusCode == 503) {
          res.json({ result: Error503() });
        }else {
          res.json({ result: "ERROR: Summoner Stats not found.  I need you to play AL LEAST 1 player game this season to work here.  Otherwise I just don't bother." });
        }
      })
    } else if (response.statusCode == 503) {
      res.json({ result: Error503() });
    } else {
      res.json({ result: "ERROR: Summoner not found.  Hopefully it was deleted to make room for someone who can play." });
    }
  })
});

function makeIDURL(charName, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/" + charName + "?api_key=" + apiKey;
}

function makeSummaryURL(charID, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.3/stats/by-summoner/" + charID + "/summary?api_key=" + apiKey;
}

function makeRankedURL(charID, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.3/stats/by-summoner/" + charID + "/ranked?api_key=" + apiKey;
}

function AggregatedStats() {
  this.botGamesPlayed = 0;
  this.killingSpree = 0;
  this.maxAssists = 0;
  this.maxChampionsKilled = 0;
  this.maxCombatPlayerScore = 0;
  this.maxLargestCriticalStrike = 0;
  this.maxLargestKillingSpree = 0;
  this.maxNodeCapture = 0;
  this.maxNodeCaptureAssist = 0;
  this.maxNodeNeutralize = 0;
  this.maxNodeNeutralizeAssist = 0;
  this.maxNumDeaths = 0;
  this.maxObjectivePlayerScore  = 0;
  this.maxTeamObjective = 0;
  this.maxTimePlayed = 0;
  this.maxTimeSpentLiving = 0;
  this.maxTotalPlayerScore = 0;
  this.mostChampionKillsPerSession = 0;
  this.mostSpellsCast = 0;
  this.normalGamesPlayed = 0;
  this.rankedPremadeGamesPlayed = 0;
  this.rankedSoloGamesPlayed = 0;
  this.totalAssists = 0;
  this.totalChampionKills = 0;
  this.totalDamageDealt = 0;
  this.totalDamageTaken = 0;
  this.totalDeathsPerSession = 0;
  this.totalDoubleKills = 0;
  this.totalFirstBlood = 0;
  this.totalGoldEarned = 0;
  this.totalHeal = 0;
  this.totalMagicDamageDealt = 0;
  this.totalMinionKills = 0;
  this.totalNeutralMinionsKilled = 0;
  this.totalNodeCapture = 0;
  this.totalNodeNeutralize = 0;
  this.totalPentaKills = 0;
  this.totalPhysicalDamageDealt = 0;
  this.totalQuadraKills = 0;
  this.totalSessionsLost = 0;
  this.totalSessionsPlayed = 0;
  this.totalSessionsWon = 0;
  this.totalTripleKills = 0;
  this.totalTurretsKilled = 0;
  this.totalUnrealKills = 0;
  this.wins = 0;
  this.losses = 0;
}
  AggregatedStats.prototype.fromJson = function(input, winInput, lossInput) {
    for (var name in this) {
      if (input.hasOwnProperty(name)) {
        this[name] = input[name];
      }
    } /*
    if (input.hasOwnProperty('botGamesPlayed')) {
      this.botGamesPlayed = input.botGamesPlayed;
    }
    if (input.hasOwnProperty('killingSpree')) {
      this.killingSpree = input.killingSpree;
    }
    if (input.hasOwnProperty('maxAssists')) {
      this.maxAssists = input.maxAssists;
    }
    if (input.hasOwnProperty('maxChampionsKilled')) {
      this.maxChampionsKilled = input.maxChampionsKilled;
    }
    if (input.hasOwnProperty('maxCombatPlayerScore')) {
      this.maxCombatPlayerScore = input.maxCombatPlayerScore;
    }
    if (input.hasOwnProperty('maxLargestCriticalStrike')) {
      this.maxLargestCriticalStrike = input.maxLargestCriticalStrike;
    }
    if (input.hasOwnProperty('maxLargestKillingSpree')) {
      this.maxLargestKillingSpree = input.maxLargestKillingSpree;
    }
    if (input.hasOwnProperty('maxNodeCapture')) {
      this.maxNodeCapture = input.maxNodeCapture;
    }
    if (input.hasOwnProperty('maxNodeCaptureAssist')) {
      this.maxNodeCaptureAssist = input.maxNodeCaptureAssist;
    }
    if (input.hasOwnProperty('maxNodeNeutralize')) {
      this.maxNodeNeutralize = input.maxNodeNeutralize;
    }
    if (input.hasOwnProperty('maxNodeNeutralizeAssist')) {
      this.maxNodeNeutralizeAssist = input.maxNodeNeutralizeAssist;
    }
    if (input.hasOwnProperty('maxNumDeaths')) {
      this.maxNumDeaths = input.maxNumDeaths;
    }
    if (input.hasOwnProperty('maxObjectivePlayerScore')) {
      this.maxObjectivePlayerScore = input.maxObjectivePlayerScore;
    }
    if (input.hasOwnProperty('maxTeamObjective')) {
      this.maxTeamObjective = input.maxTeamObjective;
    }
    if (input.hasOwnProperty('maxTimePlayed')) {
      this.maxTimePlayed = input.maxTimePlayed;
    }
    if (input.hasOwnProperty('maxTimeSpentLiving')) {
      this.maxTimeSpentLiving = input.maxTimeSpentLiving;
    }
    if (input.hasOwnProperty('maxTotalPlayerScore')) {
      this.maxTotalPlayerScore = input.maxTotalPlayerScore;
    }
    if (input.hasOwnProperty('mostChampionKillsPerSession')) {
      this.mostChampionKillsPerSession = input.mostChampionKillsPerSession;
    }
    if (input.hasOwnProperty('mostSpellsCast')) {
      this.mostSpellsCast = input.mostSpellsCast;
    }
    if (input.hasOwnProperty('normalGamesPlayed')) {
      this.normalGamesPlayed = input.normalGamesPlayed;
    }
    if (input.hasOwnProperty('rankedPremadeGamesPlayed')) {
      this.rankedPremadeGamesPlayed = input.rankedPremadeGamesPlayed;
    }
    if (input.hasOwnProperty('rankedSoloGamesPlayed')) {
      this.rankedSoloGamesPlayed = input.rankedSoloGamesPlayed;
    }
    if (input.hasOwnProperty('totalAssists')) {
      this.totalAssists = input.totalAssists;
    }
    if (input.hasOwnProperty('totalChampionKills')) {
      this.totalChampionKills = input.totalChampionKills;
    }
    if (input.hasOwnProperty('totalDamageDealt')) {
      this.totalDamageDealt = input.totalDamageDealt;
    }
    if (input.hasOwnProperty('totalDamageTaken')) {
      this.totalDamageTaken = input.totalDamageTaken;
    }
    if (input.hasOwnProperty('totalDeathsPerSession')) {
      this.totalDeathsPerSession = input.totalDeathsPerSession;
    }
    if (input.hasOwnProperty('totalDoubleKills')) {
      this.totalDoubleKills = input.totalDoubleKills;
    }
    if (input.hasOwnProperty('totalFirstBlood')) {
      this.totalFirstBlood = input.totalFirstBlood;
    }
    if (input.hasOwnProperty('totalGoldEarned')) {
      this.totalGoldEarned = input.totalGoldEarned;
    }
    if (input.hasOwnProperty('totalHeal')) {
      this.totalHeal = input.totalHeal;
    }
    if (input.hasOwnProperty('totalMagicDamageDealt')) {
      this.totalMagicDamageDealt = input.totalMagicDamageDealt;
    }
    if (input.hasOwnProperty('totalMinionKills')) {
      this.totalMinionKills = input.totalMinionKills;
    }
    if (input.hasOwnProperty('totalNeutralMinionsKilled')) {
      this.totalNeutralMinionsKilled = input.totalNeutralMinionsKilled;
    }
    if (input.hasOwnProperty('totalNodeCapture')) {
      this.totalNodeCapture = input.totalNodeCapture;
    }
    if (input.hasOwnProperty('totalNodeNeutralize')) {
      this.totalNodeNeutralize = input.totalNodeNeutralize;
    }
    if (input.hasOwnProperty('totalPentaKills')) {
      this.totalPentaKills = input.totalPentaKills;
    }
    if (input.hasOwnProperty('totalPhysicalDamageDealt')) {
      this.totalPhysicalDamageDealt = input.totalPhysicalDamageDealt;
    }
    if (input.hasOwnProperty('totalQuadraKills')) {
      this.totalQuadraKills = input.totalQuadraKills;
    }
    if (input.hasOwnProperty('totalSessionsLost')) {
      this.totalSessionsLost = input.totalSessionsLost;
    }
    if (input.hasOwnProperty('totalSessionsPlayed')) {
      this.totalSessionsPlayed = input.totalSessionsPlayed;
    }
    if (input.hasOwnProperty('totalSessionsWon')) {
      this.totalSessionsWon = input.totalSessionsWon;
    }
    if (input.hasOwnProperty('totalTripleKills')) {
      this.totalTripleKills = input.totalTripleKills;
    }
    if (input.hasOwnProperty('totalTurretsKilled')) {
      this.totalTurretsKilled = input.totalTurretsKilled;
    }
    if (input.hasOwnProperty('totalUnrealKills')) {
      this.totalUnrealKills = input.totalUnrealKills;
    }*/
    if (winInput !== null) {
      this.wins = winInput;
    }
    if (lossInput !== null) {
      this.losses = lossInput;
    }
    return this;
  }
  
function combineStatsArray(input) {
    var first = input[0];
    for (var x = 1; x < input.length; x++) {
      for (var name in input[x]) {
        if (name.indexOf('max') === 0) {
          first[name] = Math.max(first[name], input[x][name]);
        } else {
          first[name] = first[name] + input[x][name];
        }
      }
      /*first.botGamesPlayed = first.botGamesPlayed + input[x].botGamesPlayed;
      first.wins = first.wins + input[x].wins;
      first.losses = first.losses + input[x].losses;
      first.killingSpree = first.killingSpree + input[x].killingSpree;
      first.normalGamesPlayed = first.normalGamesPlayed + input[x].normalGamesPlayed
      first.rankedPremadeGamesPlayed = first.rankedPremadeGamesPlayed + input[x].rankedPremadeGamesPlayed;
      first.rankedSoloGamesPlayed = first.rankedSoloGamesPlayed + input[x].rankedSoloGamesPlayed;  
      first.totalAssists = first.totalAssists + input[x].totalAssists;
      first.totalChampionKills = first.totalChampionKills + input[x].totalChampionKills;
      first.totalDamageDealt = first.totalDamageDealt + input[x].totalDamageDealt;
      first.totalDamageTaken = first.totalDamageTaken + input[x].totalDamageTaken;
      first.totalDeathsPerSession = first.totalDeathsPerSession + input[x].totalDeathsPerSession;
      first.totalDoubleKills = first.totalDoubleKills + input[x].totalDoubleKills;
      first.totalFirstBlood = first.totalFirstBlood + input[x].totalFirstBlood;
      first.totalGoldEarned = first.totalGoldEarned + input[x].totalGoldEarned;
      first.totalHeal = first.totalHeal + input[x].totalHeal;
      first.totalMagicDamageDealt = first.totalMagicDamageDealt + input[x].totalMagicDamageDealt;
      first.totalMinionKills = first.totalMinionKills + input[x].totalMinionKills;
      first.totalNeutralMinionsKilled = first.totalNeutralMinionsKilled + input[x].totalNeutralMinionsKilled;
      first.totalNodeCapture = first.totalNodeCapture + input[x].totalNodeCapture;
      first.totalNodeNeutralize = first.totalNodeNeutralize + input[x].totalNodeNeutralize;
      first.totalPentaKills = first.totalPentaKills + input[x].totalPentaKills;
      first.totalPhysicalDamageDealt = first.totalPhysicalDamageDealt + input[x].totalPhysicalDamageDealt;
      first.totalQuadraKills = first.totalQuadraKills + input[x].totalQuadraKills;
      first.totalSessionsLost = first.totalSessionsLost + input[x].totalSessionsLost;
      first.totalSessionsPlayed = first.totalSessionsPlayed + input[x].totalSessionsPlayed;
      first.totalSessionsWon = first.totalSessionsWon + input[x].totalSessionsWon;
      first.totalTripleKills = first.totalTripleKills + input[x].totalTripleKills;
      first.totalTurretsKilled = first.totalTurretsKilled + input[x].totalTurretsKilled;
      first.totalUnrealKills = first.totalUnrealKills + input[x].totalUnrealKills;
      first.maxAssists = Math.max(first.maxAssists, input[x].maxAssists);
      first.maxChampionsKilled = Math.max(first.maxChampionsKilled, input[x].maxChampionsKilled);
      first.maxCombatPlayerScore = Math.max(first.maxCombatPlayerScore, input[x].maxCombatPlayerScore);
      first.maxLargestCriticalStrike = Math.max(first.maxLargestCriticalStrike, input[x].maxLargestCriticalStrike);
      first.maxLargestKillingSpree = Math.max(first.maxLargestKillingSpree, input[x].maxLargestKillingSpree);
      first.maxNodeCapture = Math.max(first.maxNodeCapture, input[x].maxNodeCapture);
      first.maxNodeCaptureAssist = Math.max(first.maxNodeCaptureAssist, input[x].maxNodeCaptureAssist);
      first.maxNodeNeutralize = Math.max(first.maxNodeNeutralize, input[x].maxNodeNeutralize);
      first.maxNodeNeutralizeAssist = Math.max(first.maxNodeNeutralizeAssist, input[x].maxNodeNeutralizeAssist);
      first.maxNumDeaths = Math.max(first.maxNumDeaths, input[x].maxNumDeaths);
      first.maxObjectivePlayerScore  = Math.max(first.maxObjectivePlayerScore, input[x].maxObjectivePlayerScore);
      first.maxTeamObjective = Math.max(first.maxTeamObjective, input[x].maxTeamObjective);
      first.maxTimePlayed = Math.max(first.maxTimePlayed, input[x].maxTimePlayed);
      first.maxTimeSpentLiving = Math.max(first.maxTimeSpentLiving, input[x].maxTimeSpentLiving);
      first.maxTotalPlayerScore = Math.max(first.maxTotalPlayerScore, input[x].maxTotalPlayerScore);
      first.mostChampionKillsPerSession = Math.max(first.mostChampionKillsPerSession, input[x].mostChampionKillsPerSession);
      first.mostSpellsCast = Math.max(first.mostSpellsCast, input[x].mostSpellsCast);*/
    }
    return first;
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function findInsult(input, charName) {
  var insultArray = [];
  var jsonReturned = JSON.parse(fs.readFileSync('./insults.json', 'utf8'));
  jsonReturned.insults.forEach(function(item, index) {
    insultArray.push(String(item));
  });
  var chosenInsult = insultArray[randomIntFromInterval(0,insultArray.length)];
  if ((chosenInsult === null) || (chosenInsult === undefined)) {
    chosenInsult = "_name, I got nothing.";
  } 
  chosenInsult = chosenInsult.replaceAll('_name',charName);
  chosenInsult = chosenInsult.replaceAll('_wins',String(input.wins));
  chosenInsult = chosenInsult.replaceAll('_losses',String(input.losses));
  for (var name in input) {
    chosenInsult = chosenInsult.replaceAll("_" + String(name),input[name]);
  }
  return chosenInsult;
}

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

String.prototype.replaceAll = function(search, replace) {
    return this.replace(new RegExp(RegExp.escape(search),'g'), replace);
};

function Error503() {
  return "ERROR: The Riot API is TOTALLY DOWN (503 Error).  I would complain to everyone on the Internet.  Because that makes it get fixed faster.";
}

function generateInsult(input, charName) {
  var combined = combineStatsArray(input);
  return findInsult(combined, charName);
}

module.exports = router;
