(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
 			 })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

 			 ga('create', 'UA-46453468-1', 'hatinlolserver.com');
  			ga('send', 'pageview');      

      var summonerName;
			var summonerID;
			var summonerRegion;
			
			function getInsult(sName, region) {
				var url = "/insult?charName=";
				url = url.concat(sName, "&region=", region);
				
				$.ajax({
    				type: 'GET',
    				url: url,
    				dataType: 'json',
    				success: function(output) {
                alert(output.result);
      					displayInsult(output.result);
    				},
    				async: true,
    				error: function() {
    					displayError();
    				}
				});
			}
			
			function displayInsult(insult) {
				$("#againButton").addClass("hidden");
                                $("#resetButton").addClass("hidden");
				$('#sumBox').stop();
				$("#insult").html("");
				$("#loading").addClass("hidden");
				$("#startBox").addClass("hidden");
				$("#insultBox").removeClass("hidden");
				$("#insult").typed({
        			strings: [insult],
        			typeSpeed: 0,
        			loop: false,
        			loopCount: false,
        			callback: function() { 
        				$("#againButton").removeClass("hidden");
        				$("#resetButton").removeClass("hidden");
        			}
      			});
			}
			
			function displayError() {
				$("#againButton").addClass("hidden");
        		$("#resetButton").addClass("hidden");
				$('#sumBox').stop();
				var insult = "ERROR!  Something went wrong.  Either I hit my API limit, or you can't spell.";
				$("#insult").text("");
				$("#loading").addClass("hidden");
				$("#startBox").addClass("hidden");
				$("#insultBox").removeClass("hidden");
				$("#againButton").addClass("hidden");
				$("#insult").typed({
        			strings: [insult],
        			typeSpeed: 0,
        			loop: false,
        			loopCount: false,
        			callback: function() { 
        				$("#resetButton").removeClass("hidden");
        			}
      			});
			}
			
			function resetScreen() {
				var old = $('#insult');
				var parent = old.parent();
				parent.prepend($('<a>').attr('id', 'insult'));
				old.remove();
				$('#typed-cursor').remove();
				$('#sumBox').stop();
				$("#sumBox").val("");
				$('#na').attr('checked', 'checked');
				$("#loading").addClass("hidden");
				$("#startBox").removeClass("hidden");
				$("#insultBox").addClass("hidden");
			}
			
			$(document).ready(function(){
				$('#sumBox').cssConsole();
				$('#na').attr('checked', 'checked');
				$('#generateButton').unbind("click").click( function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
					$("#startBox").addClass("hidden");
					$("#loading").removeClass("hidden");
					summonerName = $("#sumBox").val();
					summonerRegion = $("#regionForm input:checked").val();
					getInsult(summonerName, summonerRegion);
				});
				$('#againButton').unbind("click").click( function(evt) {
					var old = $('#insult');
					var parent = old.parent();
					parent.prepend($('<a>').attr('id', 'insult'));
					old.remove();
					$('#typed-cursor').remove();
					$('#sumBox').cssConsole('reset');
					$("#insultBox").addClass("hidden");
					evt.stopPropagation();
					evt.preventDefault();
					$("#insult").text("");
					$("#loading").removeClass("hidden");
					getInsult(summonerName, summonerRegion);
				});
				$('#resetButton').unbind("click").click( function(evt) {
					resetScreen();
				});
			});