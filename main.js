if (Meteor.isClient) {
  var Response;
  var dataForChart = new Object;

  Template.menu.events({
    'click button': function (event) {
      event.preventDefault();
      var token = $('#TxtToken').val();
      if (token.length == 0){
        $('#messageContainer').hide().html('').append('<div class="message alert-danger">Enter your token.</div>').fadeIn();
      }
      else {
        if (event.target.id === 'btnVerify'){
          $('#btnVerify').html('<i class="fa fa-circle-o-notch fa-spin"></i>');
          Meteor.call('verifyToken', token, function (error, result) {
            Response = result;
            if (Response.indexOf('error') > 0 ){
              $('#messageContainer').hide().html('').append('<div class="message alert-danger">You have entered an invalid token, try again.</div>').fadeIn();
              $('#btnVerify').text('Verify');
            }
            else if (Response.indexOf('error') != -1 ){
              $('#messageContainer').hide().html('').append('<div class="message alert-success">Your token appears to be valid.</div>').fadeIn();
              $('#btnVerify').text('Verify');
            }

          });
        }
        else if (event.target.id === 'btnData'){
          $('#btnData').html('<i class="fa fa-circle-o-notch fa-spin"></i>');
          Meteor.call('getInfo', token, function (error, result) {
            Response = $.xml2json(result);
            var array = Response.response.intervals.interval;

            //get the date/time in the proper formats using moment
            for (i = 0; i < array.length; i++){
                array[i].dtStartDay = moment(array[i].dtStart).format('Do MMM YY');
                array[i].dtStartTime = moment(array[i].dtStart).format('HHmm');
                array[i].dtFinishTime = moment(array[i].dtEnd).format('HHmm');
            }

            var groupedData = _.groupBy(array, function(x){
                return x.dtStartDay
            });
            var sortedData  = _.sortBy(groupedData, function(x){
                return x[0].ixInterval; 
            });
                
                dataForChart.startTimes = new Array;
                dataForChart.finishTimes = new Array;
                dataForChart.dates = new Array;

                for (i = 0; i < sortedData.length; i++){
                    dataForChart.startTimes.push(sortedData[i][0].dtStartTime);
                    dataForChart.finishTimes.push(sortedData[i][sortedData[i].length - 1].dtFinishTime);
                    dataForChart.dates.push(sortedData[i][0].dtStartDay);
                }
                for (i = 0; i < dataForChart.startTimes.length; i++) {
                    console.log(dataForChart.dates[i]);
                    console.log("start: " + dataForChart.startTimes[i]);
                    console.log("finish: " + dataForChart.finishTimes[i]);
                    console.log("");
                };
                $('#messageContainer').hide().html('').append('<div class="message alert-success">Data fetched from fogbugz successfully.</div>').fadeIn();
                $('#btnData').text('Get Data');


                // Get context with jQuery - using jQuery's .get() method.
                var ctx = $("#myChart").get(0).getContext("2d");
                // This will get the first returned node in the jQuery collection.
                var data = {
                  labels: dataForChart.dates,
                  datasets: [
                  {
                    label: "Finish Times",
                    fillColor: "rgba(151,187,205,0.4)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data:  dataForChart.finishTimes
                  },
                  {
                    label: "Start Times",
                    fillColor: "rgba(255,255,255, 0.7)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: dataForChart.startTimes
                  }
                  ]
                };
                var options = {
                  responsive: true,
                  barValueSpacing: 5,
                  animation: true,
                  scaleBeginAtZero: false,
                  scaleGridLineColor : "rgba(0,0,0,1)",
                  legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",



                };
                var myLineChart = new Chart(ctx).Line(data, options);

          });
        }
        else if (event.target.id === 'btnLogoff'){
            $('#messageContainer').hide().html('').append('<div class="message alert-success">You logged off, good job.</div>').fadeIn();
        }
      }
    }
  });

  }

  if (Meteor.isServer) {
    Meteor.startup(function () {
    
    });

    Meteor.methods({
      verifyToken: function (token) {
        //do login tings, for now we will set the token manually
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=logon&token=' + token, {} );
        return response.content;
      },
      loginToFogBugz: function(username, password){
        //https://webapplications.fogbugz.com/api.asp?cmd=logon&email=John%20Hancock&password=BigMac
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=logon&token=' + token, {} );
        return response.content;
      },
      getInfo: function (token) {
        //return the dataset for chart
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=listIntervals&token=' + token, {} );
        return response.content;
      },
        logoffToFogBugz: function(token){
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=logoff&token=' + token, {} );
        return response.content;
      }
    });
  }
