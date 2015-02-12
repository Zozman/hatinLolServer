var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var NodeCache = require( "node-cache" );
var myCache = new NodeCache( { stdTTL: 3600, checkperiod: 120 } );

/* GET Insult API call */
router.get('/', function(req, res) {
  // Get region and character name
  var region = req.query.region;
  var charName = req.query.charName;
  // Get key for cache
  var cacheKey = charName.toLowerCase()+"|"+region;
  // Attempt to find a cached version of the data
  var cacheData = myCache.get(cacheKey);
  // If there is no cached data, get fresh data
  if (isEmptyObject(cacheData)) {
    // Make request to turn charName into charID
    request(makeIDURL(charName, region), function (error, response, body) {
      // If a good response was returned
      if (!error && response.statusCode == 200) {
        // Parse the returned JSON
        var jsonObj = JSON.parse(body);
        var searchNameForArray = charName.replaceAll(" ","").toLowerCase();
        var charID = String(jsonObj[searchNameForArray].id);
        // Make request to get summoner's public game stats
        request(makeSummaryURL(charID, region), function (error2, response2, body2) {
          // If good value was returned
          if (!error2 && response2.statusCode == 200) {
            // Create array to hold AggregatedStats objects
            var aggArray = [];
            // Parse the returned JSON and for each playerStatSummary
            JSON.parse(body2).playerStatSummaries.forEach(function(item, index) {
              // Initialize wins and losses
              var wins = 0;
              var losses = 0;
              // Get wins if any are returned
              if (item.hasOwnProperty('wins')) {
                wins = item.wins;
              }
              // Get losses if any are returned
              if (item.hasOwnProperty('losses')) {
                losses = item.losses;
              }
              // Take JSON and wins and losses and create new AggregatedStats object
              // Then add it to the array
              aggArray.push(new AggregatedStats().fromJson(item.aggregatedStats, wins, losses));
            });
            // Make a request for all ranked games stats
            request(makeRankedURL(charID, region), function (error3, response3, body3) {
              // If a good result was returned
              if (!error3 && response3.statusCode == 200) {
                // Parse all the champions data
                JSON.parse(body3).champions.forEach(function(item, index) {
                  // If item 0 is found (item 0 is data for all Champions)
                  if (item.id === 0) {
                    // Add it to the array
                    aggArray.push(new AggregatedStats().fromJson(item.stats, 0, 0));
                  }
                });
                // Generate the insult
                var combinedData = combineStatsArray(aggArray);
                var finalResult = findInsult(combinedData, charName);
                // Cache data for an hour
                myCache.set(cacheKey, combinedData);
                // Return insult
                res.json({ result: finalResult, summoner:charName});
              // Else if no ranked data is returned
              } else {
                // Generate the insult
                var combinedData2 = combineStatsArray(aggArray);
                var finalResult2 = findInsult(combinedData2, charName);
                // Cache data for an hour
                myCache.set(cacheKey, combinedData2);
                // Return the insult
                res.json({ result: finalResult2, summoner:charName});
              }
            })
          // Else if a 503 is returned for the player game stats
          } else if (response.statusCode == 503) {
            // Return 503 error
            res.json({ result: Error503() });
          // Else any other error return generic error code
          }else {
            res.json({ result: makeGenericError() });
          }
        })
      // Else if a 503 is returned for the player id lookup
      } else if (response.statusCode == 503) {
        // Return 503 error
        res.json({ result: Error503() });
      } else {
        // Else any other error return generic error code
        res.json({ result: makeGenericError() });
      }
    })
  // Else return an insult using cached data
  } else {
    res.json({ result: findInsult(cacheData[cacheKey], charName), summoner:charName});
  }
});

// Function compiles and returns the url to make a call to the Riot API to get the summoner's id
function makeIDURL(charName, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/" + charName + "?api_key=" + apiKey;
}

// Function that compiles and returns the url to make a call to the Riot API to get a summoner's player game stats
function makeSummaryURL(charID, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.3/stats/by-summoner/" + charID + "/summary?api_key=" + apiKey;
}

// Function that compiles and returns the url to make a call to the Riot API to get a summoner's ranked game stats
function makeRankedURL(charID, region) {
  return "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.3/stats/by-summoner/" + charID + "/ranked?api_key=" + apiKey;
}

// Function to return a generic error
function makeGenericError() {
  return "ERROR: Summoner not found.  Hopefully it was deleted to make room for someone who can play.";
}

// Object to hold a player's stats
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
  // Function to convert a JSON AggregatedStats object to a JavaScript AggregatedStats object
  AggregatedStats.prototype.fromJson = function(input, winInput, lossInput) {
    // For each member in AggregatedStats
    for (var name in this) {
      // If the JSON has a key with the same name
      if (input.hasOwnProperty(name)) {
        // Set that key in the object to the input's value
        this[name] = input[name];
      }
    }
    // If there are wins, get the wins
    if (winInput !== null) {
      this.wins = winInput;
    }
    // If there are losses, get the losses
    if (lossInput !== null) {
      this.losses = lossInput;
    }
    // Return the converted object
    return this;
  }

  // Function to combine an array of AggregatedStats objects into one AggregatedStats object
function combineStatsArray(input) {
    // Get the first item
    var first = input[0];
    // For every other item in the array
    for (var x = 1; x < input.length; x++) {
      // For each member in AggregatedStats
      for (var name in input[x]) {
        // If it is a 'max' object
        if (name.indexOf('max') === 0) {
          // Set the master item to the larger of the two
          first[name] = Math.max(first[name], input[x][name]);
        // Else if it is a total item
        } else {
          // Add the new item to the original
          first[name] = first[name] + input[x][name];
        }
      }
    }
    // Return the combined AggregatedStats
    return first;
}

// Function to return a random integer based on a min and max value
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Function to take AggregatedStats data and a charName and make an insult using them
function findInsult(input, charName) {
  // Make array to hold insults
  var insultArray = [];
  // Read the insult file
  var jsonReturned = JSON.parse(fs.readFileSync('./insults.json', 'utf8'));
  // For each insult returned, save it to the array
  jsonReturned.insults.forEach(function(item, index) {
    insultArray.push(String(item));
  });
  // Randomly choose 1 insult from the array
  var chosenInsult = insultArray[randomIntFromInterval(0,insultArray.length)];
  // If the insult did not get returned correctly, use the backup insult
  if ((chosenInsult === null) || (chosenInsult === undefined)) {
    chosenInsult = "_name, I got nothing.";
  }
  // Replace all instances of _name in the insult with the charName
  chosenInsult = chosenInsult.replaceAll('_name',charName);
  // For each member in the AggregatedStats object
  for (var name in input) {
    // Replace the _nameOfTheCharacteristic with the stored value
    chosenInsult = chosenInsult.replaceAll("_" + String(name),input[name]);
  }
  // Return the completed insult
  return chosenInsult;
}

// Helper function to handle Regular Expressions escape
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Helper function to handle a replace all for a string
String.prototype.replaceAll = function(search, replace) {
    return this.replace(new RegExp(RegExp.escape(search),'g'), replace);
};

// Function to tell if we have an empty object (used with cache)
// From http://stackoverflow.com/questions/11480769/how-can-i-check-if-a-json-is-empty-in-nodejs
function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

// Function to return a basic 503 error message
function Error503() {
  return "ERROR: The Riot API is TOTALLY DOWN (503 Error).  I would complain to everyone on the Internet.  Because that makes it get fixed faster.";
}

// Function to generate an insult
function generateInsult(input, charName) {
  // Combine all character data into one AggregatedStats
  var combined = combineStatsArray(input);
  // Build and find the insult
  return findInsult(combined, charName);
}

module.exports = router;
