// Congressional apportionment based on population

// population source: http://lwd.dol.state.nj.us/labor/lpa/census/1990/poptrd1.htm
// population source #2: http://en.wikipedia.org/wiki/List_of_U.S._states_by_historical_population

// "state" is the name of the state
// "pop" is the state population according to the 1870 census
// "seats" is the number of seats the state had in reality
var data = [
  {state: 'Alabama', pop: 996992, seats: 8},
  {state: 'Arkansas', pop: 484471, seats: 4},
  {state: 'California', pop: 560247, seats: 4},
  {state: 'Colorado', pop: 39864, seats: 1},
  {state: 'Connecticut', pop: 537454, seats: 4},
  {state: 'Delaware', pop: 125015, seats: 1},
  {state: 'Florida', pop: 187748, seats: 2},
  {state: 'Georgia', pop: 1184109, seats: 9},
  {state: 'Illinois', pop: 2539891, seats: 19},
  {state: 'Indiana', pop: 1680637, seats: 13},
  {state: 'Iowa', pop: 1194020, seats: 9},
  {state: 'Kansas', pop: 364399, seats: 3},
  {state: 'Kentucky', pop: 1321011, seats: 10},
  {state: 'Louisiana', pop: 726915, seats: 6},
  {state: 'Maine', pop: 626915, seats: 5},
  {state: 'Maryland', pop: 780894, seats: 6},
  {state: 'Massachusetts', pop: 1457351, seats: 11},
  {state: 'Michigan', pop: 1184059, seats: 9},
  {state: 'Minnesota', pop: 439706, seats: 3},
  {state: 'Mississippi', pop: 827922, seats: 6},
  {state: 'Missouri', pop: 1721295, seats: 13},
  {state: 'Nebraska', pop: 122993, seats: 1},
  {state: 'Nevada', pop: 42491, seats: 1},
  {state: 'New Hampshire', pop: 318300, seats: 3},
  {state: 'New Jersey', pop: 906096, seats: 7},
  {state: 'New York', pop: 4382759, seats: 33},
  {state: 'North Carolina', pop: 1071361, seats: 8},
  {state: 'Ohio', pop: 2665260, seats: 20},
  {state: 'Oregon', pop: 90923, seats: 1},
  {state: 'Pennsylvania', pop: 3521951, seats: 27},
  {state: 'Rhode Island', pop: 217353, seats: 2},
  {state: 'South Carolina', pop: 705606, seats: 5},
  {state: 'Tennessee', pop: 1258520, seats: 10},
  {state: 'Texas', pop: 818579, seats: 6},
  {state: 'Vermont', pop: 330551, seats: 3},
  {state: 'Virginia', pop: 1225163, seats: 9},
  {state: 'West Virginia', pop: 442014, seats: 3},
  {state: 'Wisconsin', pop: 1054670, seats: 8}
];

// there were 293 representatives in the House from 1873 - 1883
// http://en.wikipedia.org/wiki/History_of_the_United_States_House_of_Representatives#Number_of_Representatives
var totalSeats = 293;
var totalPopulation = 0;

// compute total population
for(var i = 0; i < data.length; i++) {
  totalPopulation += data[i].pop;
}

// compute standard divisor, state quotas
var standardDivisor = totalPopulation / totalSeats;
for(var i = 0; i < data.length; i++) {
  data[i].standardQuota = data[i].pop / standardDivisor;
  data[i].lowerQuota = Math.floor(data[i].standardQuota);
  data[i].upperQuota = Math.ceil(data[i].standardQuota);
}

// Huntington-Hill method: http://en.wikipedia.org/wiki/United_States_congressional_apportionment#The_Method_of_Equal_Proportions
var huntingtonHillMethod = function() {
  var seats = 'huntingtonHill';
  var remainingSeats = totalSeats;

  // initialize each state with 1 seat
  for(var i = 0; i < data.length; i++) {
    data[i][seats] = 1;
    remainingSeats -= 1;
  }

  // allocate remaining seats
  while(remainingSeats > 0) {
    var max = 0;
    var maxIndex = -1;
    for(var i = 0; i < data.length; i++) {
      var numSeats = data[i][seats];
      var div = data[i].pop / Math.sqrt(numSeats * (numSeats + 1));
      if(div > max) {
        max = div;
        maxIndex = i;
      }
    }
    data[maxIndex][seats]++;
    remainingSeats--;
  }
};

// Apportionment methods: http://www.ctl.ua.edu/math103/apportionment/appmeth.htm
var hamiltonMethod = function() {
  var seats = 'hamilton';
  var remainingSeats = totalSeats;

  // compute initial seat allotments
  for(var i = 0; i < data.length; i++) {
    data[i][seats] = data[i].lowerQuota;
    if(data[i][seats] === 0) {
      data[i][seats] = 1;
    }
    data[i].surplus = data[i].standardQuota - data[i][seats];
    remainingSeats -= data[i][seats];
  }

  // sort data by surplus
  data.sort(function(a, b) {
    return b.surplus - a.surplus;
  });

  // assign remaining seats in order of decreasing surplus
  var i = 0;
  while(remainingSeats > 0) {
    data[i][seats]++;
    remainingSeats--;
    i++;
  }

  // sort data by state name
  data.sort(function(a, b) {
    return a.state.localeCompare(b.state);
  });
};

// Apportionment methods: http://www.ctl.ua.edu/math103/apportionment/appmeth.htm
var jeffersonMethod = function() {
  var seats = 'jefferson';

  // initialize modified quotas
  var modifiedDivisor = standardDivisor;

  // compute seat allotments
  while(true) {
    var seatsAllotted = 0;
    for(var i = 0; i < data.length; i++) {
      data[i].modifiedQuota = data[i].pop / modifiedDivisor;
      data[i][seats] = Math.floor(data[i].modifiedQuota);
      if(data[i][seats] === 0) {
        data[i][seats] = 1;
      }
      seatsAllotted += data[i][seats];
    }
    if(seatsAllotted === totalSeats) break;
    else if(seatsAllotted > totalSeats) modifiedDivisor++;
    else modifiedDivisor--;
  }
};

// Apportionment methods: http://www.ctl.ua.edu/math103/apportionment/appmeth.htm
var websterMethod = function() {
  var seats = 'webster';

  // initialize modified quotas
  var modifiedDivisor = standardDivisor;

  // compute seat allotments
  while(true) {
    var seatsAllotted = 0;
    for(var i = 0; i < data.length; i++) {
      data[i].modifiedQuota = data[i].pop / modifiedDivisor;
      data[i][seats] = Math.round(data[i].modifiedQuota);
      if(data[i][seats] === 0) {
        data[i][seats] = 1;
      }
      seatsAllotted += data[i][seats];
    }
    if(seatsAllotted === totalSeats) break;
    else if(seatsAllotted > totalSeats) modifiedDivisor++;
    else modifiedDivisor--;
  }
};

// print results
var printCSV = function(columns) {
  var line = '';
  for(var j = 0; j < columns.length; j++) {
    line += columns[j];
    if(j < columns.length - 1) {
      line += ',';
    }
  }
  console.log(line);

  for(var i = 0; i < data.length; i++) {
    line = '';
    for(var j = 0; j < columns.length; j++) {
      line += data[i][columns[j]];
      if(j < columns.length - 1) {
        line += ',';
      }
    }
    console.log(line);
  }
}

jeffersonMethod();
hamiltonMethod();
websterMethod();
huntingtonHillMethod();

printCSV([
  'state',
  'seats',
  'jefferson',
  'hamilton',
  'webster',
  'huntingtonHill'
]);
