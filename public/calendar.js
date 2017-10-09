      // Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com
      var CLIENT_ID = '617379336476-o1ife0rbmhvtohv4sds2acd1qitkbuuq.apps.googleusercontent.com';

      var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        });

        request.execute(function(resp) {
          // var events = resp.items;
          // appendPre('Upcoming events:');

          // if (events.length > 0) {
          //   for (i = 0; i < events.length; i++) {
          //     var event = events[i];
          //     var when = event.start.dateTime;
          //     if (!when) {
          //       when = event.start.date;
          //     }
          //     appendPre(event.summary + ' (' + when + ')')
          //   }
          // } else {
          //   appendPre('No upcoming events found.');
          // }

          var events = resp.items;

          $('#calendarTbl tr').remove();
          var table = document.getElementById('calendarTbl')
          var nextRow = -1;

          for (i=0; i<11; i++) {
            var event = events[i];
            var now = new Date();
            var when = event.start.dateTime;
            if (!when) {
              when = event.start.date;
            }

            if (when.length>10) {
              var dateTime = when.split('T');
              var date = dateTime[0].split('-');

              var startYear = date[0];
              var startMonth = date[1];
              var startDay = date[2];
              var startTime = dateTime[1];
              var startTimeFormat = startTime.split('+')
              var startTime = startTimeFormat[0];

                if (startYear == now.getFullYear()) {
                  dateOut = startDay + '/' + startMonth + ' @ ' + startTime;
                } else {
                  dateOut = startDay + '/' + startMonth + '/' + startYear + ' @ ' + startTime;
                }

            } else {
              var date = when.split('-');
              var startYear = date[0];
              var startMonth = date[1];
              var startDay = date[2];

                if (startYear == now.getFullYear()) {
                  dateOut = startDay + '/' + startMonth;
                } else {
                  dateOut = startDay + '/' + startMonth + '/' + startYear;
                }
            }

            nextRow++;
            table.insertRow(nextRow);
            table.rows[nextRow].insertCell(0);
            table.rows[nextRow].cells[0].innerHTML = event.summary;
            table.rows[nextRow].insertCell(1);
            table.rows[nextRow].cells[1].innerHTML = dateOut;
          }

        });
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }
