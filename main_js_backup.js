<script type="text/javascript">
  var STAR_MAX_DISTANCE = 5;
  var STAR_SCALE = 2;
  var STEP_NUMBER_DIST = 15;
  var LANDMARK_MIN_DISTANCE = 50;
  var LANDMARK_MAX_DISTANCE = 800;



  var map;
  var LatLngControl;
  var directionSteps;
  var directionPath;
  var directionConstellationGroup;
  var landmarksInBounds = [];
  var starGroup;

  var starPath1 =
    "M262.825007,167 L264.540905,168.36331 L266.278803,167.113278 L265.258953,169.026826 L267.017681,170.369305 L264.97927,170.097463 L264.812747,171.927808 L264.021794,169.889397 L262,169.845163 L263.561077,168.830345 L262.825007,167 Z"
  var starPath2 =
    "M249.13078,166 L251.080893,168.870331 L253.836463,167.733216 L251.98488,170.002364 L253.767115,172.276759 L251.206474,171.274241 L250.45184,173.864064 L249.974271,170.847987 L247,170.889957 L249.865085,169.402821 L249.13078,166 Z"

  function LatLngControl(map) {
    this.setMap(map);
  }

  LatLngControl.prototype = new google.maps.OverlayView();
  LatLngControl.prototype.draw = function() {};

  LatLngControl.prototype.updatePosition = function(latLng) {
    var projection = this.getProjection();
    var point = projection.fromLatLngToContainerPixel(latLng);

    return ([point.x, point.y])
  };


  function init() {
    var directionsService = new google.maps.DirectionsService;
    var centerLatLng = new google.maps.LatLng(37.748582, -122.418411);
    map = new google.maps.Map(document.getElementById('map'), {
      'zoom': 10,
      'center': centerLatLng,
      'mapTypeId': google.maps.MapTypeId.ROADMAP
    });


    latLngControl = new LatLngControl(map);

    getDirections(directionsService, "40.443489, -79.941609", "40.441581, -79.952815");
  }


  function getDirections(directionsService, start, end) {
    directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        makeLines(getDirectionSteps(response))
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  function getDirectionSteps(response) {
    var bounds = new google.maps.LatLngBounds();
    directionSteps = []
    var legs = response.routes[0].legs;
    $(legs).each(function(index, item) {
      $(item.steps).each(function(index, item) {
        var pathLength = item.path.length
        var pathStart = item.path[0]
        var pathEnd = item.path[pathLength - 1]
          // console.log(item.path[0].lat(), item.path[0].lng())
        var legPoints = []
        $(item.path).each(function(index, item) {
          bounds.extend(item);
          legPoints.push([item.lat(), item.lng()])
        });
        // set a variable so we know if this direction contains the "toward" thing
        if (item.instructions.indexOf('toward') != -1) {
          var toward = true;
        } else {
          var toward = false;
        }
        var step = {
          step: index + 1,
          instructions: item.instructions,
          distance: item.distance.text,
          duration: item.duration.text,
          points: legPoints,
          start: pathStart,
          end: pathEnd,
          isToward: toward
        }
        directionSteps.push(step)
      });
    });
    map.fitBounds(bounds);
    map.setZoom(map.getZoom())
    return directionSteps
  }

  paper.install(window);
  paper.setup('mainCanvas');

  function makeLines(directionSteps) {
    directionPath = new Path();
    directionPath.strokeColor = '#999999';
    directionPath.strokeWidth = 1;
    // directionPath.dashArray = [2, 5];

    directionConstellationGroup = new Group()
    directionConstellationGroup.addChild(directionPath)

    starGroup = new Group()

    $(directionSteps).each(function(index, item) {
      for (i = 0; i < item.points.length; i++) {
        var pixelCoords = latLngControl.updatePosition(new google.maps.LatLng(item.points[i][0], item.points[i][1]))
          // console.log(pixelCoords)
        directionPath.add(new Point(pixelCoords[0], pixelCoords[1]))
      }
    })
    directionPath.flatten(STAR_MAX_DISTANCE);
    // console.log(directionSteps)
    var directionCount = 1;
    $(directionSteps).each(function(index, item) {
        var step = directionSteps[index]
        if (step.isToward == false) {
          console.log(directionSteps[index].instructions)
          var directionStepWaypoint = new google.maps.LatLng(step.start.lat(), step.start.lng())
          var pixelStartCoords = latLngControl.updatePosition(directionStepWaypoint)
          drawStarAtPoint(pixelStartCoords[0], pixelStartCoords[1])
          drawStepNumbers(directionCount, pixelStartCoords[0], pixelStartCoords[1])
          directionCount += 1;
        }
        if (index == directionSteps.length - 1) {
          var directionStepWaypoint = new google.maps.LatLng(step.end.lat(), step.end.lng())
          var pixelEndCoords = latLngControl.updatePosition(directionStepWaypoint)
          drawStarAtPoint(pixelEndCoords[0], pixelEndCoords[1])
        }
      })
      // fitConstellationGroup()
    drawLandmarks()
    paper.view.draw()
      // console.log(directionSteps)
  }

  function drawStarAtPoint(x, y) {
    if (Math.random() >= 0.5) {
      var star = new Path(starPath1)
    } else {
      var star = new Path(starPath2)
    }
    star.fillColor = 'black'
    star.scale(STAR_SCALE)
    star.rotate(Math.random() * 100)
    star.position = new Point(x, y);
    // starGroup.addChild(star)
    directionConstellationGroup.addChild(star)
    starGroup.addChild(star)
  }

  function drawStepNumbers(stepIndex, x, y) {
    var step = directionSteps[stepIndex]
    var stepNumberPoint = new Point(x, y)
    var stepNumber = new PointText(stepNumberPoint)
    var stepNumber = new PointText({
      point: stepNumberPoint,
      content: stepIndex,
      justification: 'center',
      fillColor: 'black',
      fontFamily: 'Helvetica'
    })

    // stepNumber.fontFamily = 'machine_script'
    // stepNumber.justification = 'center'
    // stepNumber.fillColor = 'black'
    // stepNumber.content = stepIndex
    var dist = STEP_NUMBER_DIST
    var pointPossibilities = [
      new Point(x, y - dist),
      new Point(x + (dist / 2), y - dist),
      new Point(x + dist, y),
      new Point(x + dist, y + (dist / 2)),
      new Point(x, y + dist),
      new Point(x - (dist / 2), y + dist),
      new Point(x - dist, y),
      new Point(x - dist, y - (dist / 2))
    ]
    while (stepNumber.intersects(directionPath)) {
      var newStepNumberPoint = pointPossibilities[Math.floor(Math.random() * pointPossibilities.length)];
      stepNumber.position = newStepNumberPoint
    }
    directionConstellationGroup.addChild(stepNumber)
  }

  function drawLandmarks() {
    var landmarks = [
      [40.444279, -79.953263],
      [40.444406, -79.942803],
      [40.442239, -79.943450],
      [40.441098, -79.943721],
      [40.440463, -79.946014],
      [40.438977, -79.947742],
      [40.443290, -79.950152],
      [40.438361, -79.922636],
      [40.445371, -79.941967],
      [40.446431, -79.951147],
      [40.447231, -79.949764],
      [40.444846, -79.956198],
      [40.437890, -79.938214],
      [40.442429, -79.946998],
      [40.444859, -79.948743]
    ]
    for (i = 0; i < landmarks.length; i++) {
      var latlng = new google.maps.LatLng(landmarks[i][0], landmarks[i][1])
        // console.log(latlng.lat(), latlng.lng())
      if (map.getBounds().contains(latlng) == true) {
        var landmarkPixelCords = latLngControl.updatePosition(latlng)
        landmarksInBounds.push(landmarkPixelCords)
          // var waypoint = new Shape.Circle(new Point(landmarkPixelCords[0], landmarkPixelCords[1]), 5);
          // waypoint.strokeColor = 'black';

      }
    }
    var placedLandmarkCount = 0;
    for (i = 0; i < landmarksInBounds.length; i++) {
      var isTooClose = false
        // var cloneDirectionPath = directionPath.clone({
        //   insert: false
        // })
        // cloneDirectionPath.flatten(50)
        // console.log(cloneDirectionPath.segments[0].point)
      for (j = 0; j < directionPath.segments.length; j++) {
        var landmarkPoint = new Point(landmarksInBounds[i][0], landmarksInBounds[i][1])
        var starPoint = directionPath.segments[j].point
        var distPath = new Path.Line(landmarkPoint, starPoint)
        if (distPath.length < LANDMARK_MIN_DISTANCE) {
          // || distPath.length > LANDMARK_MAX_DISTANCE
          isTooClose = true
        }
        distPath.remove()
      }
      if (isTooClose == false && placedLandmarkCount < 3) {
        var landmark = new Shape.Circle(landmarkPoint, 5)
        landmark.strokeColor = 'black'
        placedLandmarkCount += 1
      }
    }

  }


  function fitConstellationGroup() {
    // basic shitty function right now. should be smarter
    var boundsHeight = directionConstellationGroup.bounds.height
    var boundsWidth = directionConstellationGroup.bounds.width
    if (boundsHeight > boundsWidth) {
      directionConstellationGroup.rotate(90)
    }
  }


  google.maps.event.addDomListener(window, 'load', init);
</script>
