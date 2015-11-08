if (Meteor.isClient) {
  var Response;
  var dataForChart = new Object;

  Template.menu.events({
    'click button': function (event) {
      event.preventDefault();
      var token = $('#TxtToken').val();

      if (token){
        if (event.target.id === 'btnVerify'){
          $('#btnVerify').html('<i class="fa fa-circle-o-notch fa-spin"></i>');
          Meteor.call('verifyToken', token, function (error, result) {
            Response = result;
            if (Response.indexOf('error') != -1 ){
              $('#messageContainer').append('<div class="message alert-success">Your token appears to be valid.</div>');
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
                array[i].dtStartTime = moment(array[i].dtStart).format('hh:mm A');
                array[i].dtFinishTime = moment(array[i].dtEnd).format('hh:mm A');
            }

            var groupedData = _.groupBy(array, function(x){return x.dtStartDay});
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
                $('#messageContainer').append('<div class="message alert-success">Data fetched from fogbugz successfully.</div>');
                $('#btnData').text('Get Data');
          });
        }
        else if (event.target.id === 'btnLogoff'){
            $('#messageContainer').append('<div class="message alert-success">You logged off, good job.</div>');
        }
      }
    }
  });
  Template.chart.rendered = function(){
      // Get context with jQuery - using jQuery's .get() method.
      var ctx = $("#myChart").get(0).getContext("2d");
      // This will get the first returned node in the jQuery collection.
      var data = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "January", "February", "March", "April", "May", "June", "July"],
        datasets: [
        {
          label: "My First dataset",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: "My Second dataset",
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90]
        }
        ]
      };
      var options = {
        responsive: true
      };
      var myLineChart = new Chart(ctx).Line(data, options);
    };

  }

  if (Meteor.isServer) {
    Meteor.startup(function () {
    
    });

    Meteor.methods({
      verifyToken: function (token) {
        //do login tings, for now we will set the token manually
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=login&token=' + token, {} );
        return response.content;
      },
      loginToFogBugz: function(username, password){
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=login&token=' + token, {} );
        return response.content;
      },
      getInfo: function (token) {
        //return the dataset for chart
        debugger;
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=listIntervals&token=' + token, {} );
        return response.content;
      },
        logoffToFogBugz: function(token){
        var response = HTTP.call( 'GET', 'https://webapplications.fogbugz.com/api.asp?cmd=logoff&token=' + token, {} );
        return response.content;
      }
    });
  }
