Hatin' LoL Server
=================
The Hatin' LoL Server is a web application designed to take a player's stats in League of Legends over the current season, compile them, and then insult the user about them.  Build using Node.js and Express, and retrieves data from the [Riot Games API](https://developer.riotgames.com/ "Riot Games API").

Data
----
The application uses data from the [Riot Games API](https://developer.riotgames.com/ "Riot Games API").  This application takes the current stats of a Summoner for the current season, both Ranked and Player matches and combines them.

Insults
-------

Each insult is kept in the `insults.json` file as string in an array of insults.  Values that are variables are represented by a _ followed by the variable's name in order to allow the easy addition of new insults.  The application then picks one at random and used the user's stats to generate the final insult.

Accessable Variables:
---------------------

The followind are usable by the server to generate insults:
- _name
- _botGamesPlayed
- _killingSpree
- _maxAssists
- _maxChampionsKilled
- _maxCombatPlayerScore
- _maxLargestCriticalStrike
- _maxLargestKillingSpree
- _maxNodeCapture
- _maxNodeCaptureAssist
- _maxNodeNeutralize
- _maxNodeNeutralizeAssist
- _maxNumDeaths
- _maxObjectivePlayerScore
- _maxTeamObjective
- _maxTimePlayed
- _maxTimeSpentLiving
- _maxTotalPlayerScore
- _mostChampionKillsPerSession
- _mostSpellsCast
- _normalGamesPlayed
- _rankedPremadeGamesPlayed
- _rankedSoloGamesPlayed
- _totalAssists
- _totalChampionKills
- _totalDamageDealt
- _totalDamageTaken
- _totalDeathsPerSession
- _totalDoubleKills
- _totalFirstBlood
- _totalGoldEarned
- _totalHeal
- _totalMagicDamageDealt
- _totalMinionKills
- _totalNeutralMinionsKilled
- _totalNodeCapture
- _totalNodeNeutralize
- _totalPentaKills
- _totalPhysicalDamageDealt
- _totalQuadraKills
- _totalSessionsLost
- _totalSessionsPlayed
- _totalSessionsWon
- _totalTripleKills
- _totalTurretsKilled
- _totalUnrealKills
- _wins
- _losses
