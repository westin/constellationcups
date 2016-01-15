var PERSONS_NAME = ''
var finalDestination = []
var FILE = ''


function downloadDataUri(options) {
  if (!options.url)
    options.url = "http://download-data-uri.appspot.com/";
  $('<form method="post" action="' + options.url + '" style="display:none"><input type="hidden" name="filename" value="' + options.filename + '"/><input type="hidden" name="data" value="' + options.data + '"/></form>').appendTo('body').submit().remove();
}

function onMouseDown(event) {
  var svg = project.exportSVG({
    asString: true
  });
  // FILE = 'data:image/svg+xml;base64,' + btoa(svg)
  console.log(svg)



function timeStamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes()];

// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
  time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }

// Return the formatted string
  return time.join(".") + ' ' + suffix;
}



  uploadMedia = function(filename, mdata) {
		var accesstoken = '1-Lf0XYUe7oAAAAAAAENtLlPWO-A81SrM9JbUBOza3COUER5XTwQdUWL45Hl2lqA'
      $.ajax({
        type: 'POST',
        url: 'https://api-content.dropbox.com/1/files_put/auto/constellation_exports/' + filename,
        headers: { 'Authorization': 'Bearer ' + accesstoken, 'Content-Type': 'text/plain'},
        dataType: 'html',
        processData: false,
        data: mdata,
        success: function(data) {
          alert(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert("Error when uploading file: " + textStatus + " because:" + errorThrown);
        }
      });
    }

		uploadMedia(timeStamp() + '.svg', svg)

    // downloadDataUri({
    //   data: 'data:image/svg+xml;base64,' + btoa(svg),
    //   filename: 'export.svg'
    // });


}



$(document).ready(function() {
  var $form = $('#container').flickity({
    // options
    cellAlign: 'left',
    wrapAround: false,
    freeScroll: false,
    autoPlay: false,
    draggable: false,
    selectedAttraction: 0.2,
    friction: 0.8,
    contain: true,
    prevNextButtons: false,
    pageDots: false
  });

  $("#namefield").focus()

  // $form.flickity( 'select', 3 );

  function hideKeyboard() {
    document.activeElement.blur();
    $("input").blur();
  };


  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }



  // pick desitnations
  shuffle(destinations)
  console.log(destinations[0], destinations[1])
  if (destinations[0].question.length < 1) {
    destinations[0].question = "NO QUESTION GIVEN :("
    destinations[0].trueAnswer = "True"
    destinations[0].falseAnswer = "False"
  }
  if (destinations[1].question.length < 1) {
    destinations[1].question = "NO QUESTION GIVEN :("
    destinations[1].trueAnswer = "True"
    destinations[1].falseAnswer = "False"
  }

  $("#step2 .question span").text(destinations[0].question)
  $("label[for='radio1']").text(destinations[0].trueAnswer)
  $("label[for='radio2']").text(destinations[0].falseAnswer)

  $("#step3 .question span").text(destinations[1].question)
  $("label[for='radio3']").text(destinations[1].trueAnswer)
  $("label[for='radio4']").text(destinations[1].falseAnswer)

  $('#next-button').click(function() {
    if ($(".is-selected")[0].id == "step1") {
      PERSONS_NAME = $("#namefield").val()
      console.log("finished step one & the name is: " + PERSONS_NAME)
      hideKeyboard()
      $("#next").fadeOut(100)


      $form.flickity('next');
      $("input:radio[name=destination0]").click(function() {
        setTimeout(function() {
          $form.flickity('next');
          doStep2()
        }, 250);

      })

    }
  });

  function doStep2() {
    console.log("finished step 2: ")
    if ($("input:radio[name=destination0]").val() == destinations[0].trueAnswer) {
      destinations[0].wasChosen = true
    } else {
      destinations[0].wasChosen = false
    }

    $("input:radio[name=destination1]").click(function() {
      setTimeout(function() {
        $form.flickity('next');
        doStep3()
      }, 250);
    })
  }

  function doStep3() {
    console.log("finished step 3")
    if ($("input:radio[name=destination1]").val() == destinations[1].trueAnswer) {
      destinations[1].wasChosen = true
    } else {
      destinations[1].wasChosen = false
    }

    pickDestination(destinations[0], destinations[1])
  }

  $("#namefield").keyup(function() {
    $nameform = $("#namefield")
    if ($("#namefield").val() != '') {
      $("#next").fadeIn(100)
    }
  });


  // $(document).ready(function() {
  //   $("button").click(function() {
  //     $("p").hide();
  //   });
  // });

  $("#step4 svg").click(function() {
    location.reload();
  })

});




function pickDestination(opt1, opt2) {
  if (opt1.wasChosen == true && opt2.wasChosen == true) {
    if (Math.random() >= 0.5) {
      finalDestination = opt1
    } else {
      finalDestination = opt2
    }
  }
  if (opt1.wasChosen == true) {
    finalDestination = opt1
  }
  if (opt2.wasChosen == true) {
    finalDestination = opt2
  }
  if (opt1.wasChosen == false && opt2.wasChosen == false) {
    if (Math.random() >= 0.5) {
      finalDestination = opt1
    } else {
      finalDestination = opt2
    }
  }
  console.log(PERSONS_NAME + " will be navigating to " + finalDestination.name + " at " + String(finalDestination.lat) + ", " + String(finalDestination.lng))
  getDirections(directionsService, "40.444359, -79.941564", String(finalDestination.lat) + ", " + String(finalDestination.lng))
}
