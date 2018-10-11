var canvas;
var blockSize = 32; // pixels
// all arrays
var buildings;
var people;
// currently owned
var stone = 0.0;
var wood = 50.0;
var food = 120.0;

// recieved per person working per year
var foodProduction = 5.0;
var stoneProduction = 0.5;
var woodProduction = 1.0;

// seconds to one year
var yearsPerSecond = .5;

// food eaten per person per second
var foodConsumption = 0.5;

var burnDamage = 4;
var burnStopChance = 0.3; // chances of a burning building to stop burning 0 - no chance, 1 - 100% chance
var buildingRegenRate = 0.5;

var ss;
var testImage;
var backgroundImage;
//var imageMultiplier = 1; // make images bigger

var personCounter = 0;

var running = true;

var debugMode;
var debugKey = 192;

function setup() {

	console.log(new Building());

	debugMode = false;
	// setup canvas
	canvas = createCanvas(640, 320);

	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);
	//canvas.keyReleased(onKeyReleased);
	

	// assign canvas to html div
	canvas.parent("canvas-holder");

	ss = loadImage("https://i.imgur.com/xrD3UEv.png");
	testImage = loadImage("https://i.imgur.com/Kfjvz9f.jpg");
	backgroundImage = loadImage("https://i.imgur.com/bLxcjh3.jpg");

	setFrameRate(32);

	setUpWorld(20);
}

function keyReleased(){
	console.log(keyCode);	
	if (keyCode==debugKey){
		debugMode = !debugMode;
		console.log("debug mode: " + debugMode);
	}
}

function draw() {
	if (running){
		image(backgroundImage, 0, 0, width, height);
		fill(255, 90);
		rect(0, 0, width, height);
		//console.log(getFrameRate());
		builderAI();
		for (var q = 0; q < buildings.length; q++){
			image(ss,q*blockSize,height-blockSize,blockSize,blockSize,0,0,31,32);
			buildings[q].draw(q*blockSize);
			buildings[q].update();
		}
		for (var q = 0; q < people.length; q++){
			people[q].draw();
			people[q].update();
		}
		// HUD
		textSize(12);
		fill(255);
		noStroke();
		text("Population: " + parseInt(getPopulation()), width-100, 16);
		text("Wood: " + parseInt(wood), width-100, 16*2);
		text("Stone: " + parseInt(stone), width-100, 16*3);
		text("Food: " + parseInt(food), width-100, 16*4);
		
		if (debugMode){
			text("needFarms:"+needFarms()+",needHouses:"+needHouses()
				+",needForrest:"+needForrests()+",needQuarries:"+needQuarries(), 20, 32);

			var occ = "";
			for (var q = 0; q < people.length; q++){
				occ += people[q].getOccupation()+",";
			}
			text("occupations:"+occ, 20, 48);
		}
	}
}

function pause(){
	running = false;
}

function resume(){
	running = true;
}

function setUpWorld(worldWidth){
	buildings = [];
	people = [new Person(32.0, 16, 0), new Person(64.0, 16, 1)];
	for (var q = 0; q < worldWidth; q++){
		buildings[q] = new Building();
	}
}

function onMousePressed() {}

function needFarms(){
	return !needFarmers() && needFoodProduction();
}

function needFarmers(){
	return getBuildingsByType(3) - getPeopleByOccupation(1) > 0;
}

function needFoodProduction(){
	return getTotalFoodProduction()-getTotalFoodConsumption()*1.5 < 0;
}

function needHouses(){
	return getPopulation() - getTotalHousingSpace() > 0;
}

function needForrests(){
	// only make a forrest for every 10 people
	return !needForrestWorkers() && getPopulation()/10 >= getForrests();
}

function needForrestWorkers(){
	return getBuildingsByType(6) - getPeopleByOccupation(3) > 0;
}

function needQuarries(){
	return !needQuarryWorkers() && getPopulation()/15 >= getQuarries();
}

function needQuarryWorkers(){
	return getBuildingsByType(5) - getPeopleByOccupation(2) > 0;
}

function getPopulation(){
	return people.length;
}

function getFarms(){
	return getBuidlingsByType(3);
}

function getForrests(){
	return getBuildingsByType(6);
}

function getQuarries(){
	return getBuildingsByType(5);
}

function getBuildingsByType(bType){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==bType){
			sum++;
		}
	}
	return sum;
}

function getPeopleByOccupation(occ){
	var sum = 0;
	for (var q = 0; q < people.length; q++){
		if (people[q].getOccupation()==occ){
			sum++;
		}
	}
	return sum;
}

function getTotalHousingSpace(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		sum+=buildings[q].getHousingSpace();
	}
	return sum;
}

function getTotalFoodProduction(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==3){
			sum+=buildings[q].getHousingSpace()*foodProduction;
		}
	}
	return sum;
}

function getTotalFoodConsumption(){
	return people.length*foodConsumption;
}

function randomDeath(){
	var index = Math.random()*people.length;
	console.log(index);
	people[parseInt(index)].die("testing");
}

function getOpenLand(){
	if (getBuildingsByType(0) == 0)
		return -1;
	var index = -1;
	do {
		index = Math.random()*buildings.length;
	} while (buildings[parseInt(index)].getType() != 0);
	return parseInt(index);
}

function builderAI(){
	// have empty spots
	if (getBuildingsByType(0) == 0)
		return;
	
	if (needFarms()){
		if (canBuild(FARM)){
			buildBuilding(FARM, getOpenLand());
			console.log("Building farm...");
		}
	}
	else if (needHouses()){
		if (canBuild(STONE_HOUSE)){
			buildBuilding(STONE_HOUSE, getOpenLand());
			console.log("Building stone house...");
		} 
		else if (canBuild(WOODEN_HOUSE)) {
			buildBuilding(WOODEN_HOUSE, getOpenLand());
			console.log("Building wooden house...");
		}
	}
	else if (needForrests()){
		if (canBuild(FORREST)){
			buildBuilding(FORREST, getOpenLand());
			console.log("Building forrest...");
		}
	}
	else if (needQuarries()){
		if (canBuild(QUARRY)){
			buildBuilding(QUARRY, getOpenLand());
			console.log("Building quarries...");
		}
	}
}

function buildBuilding(building, index){
	// make sure they have the required resources
	if (!canBuild(building))
		return false;
	// remove resources
	stone -= building.stone;
	wood -= building.wood;
	// set the building
	buildings[index].resetType(building.bType);
	return true;
}

function canBuild(building){
	if (building.wood>wood || building.stone>stone)
		return false;
	return true;
}

function getPersonByID(id){
	for (var q = 0; q < people.length; q++){
		if (people[q].getID()==id){
			return people[q];
		}
	}
	return null;
}

function openSpaceInHouses(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		sum += buildings[q].getHousingSpace()-buildings[q].getInhabitants();
	}
	return sum;
}

function findClosestBuilding(x, buildingSearch){
	var index = -1;
	var distance = -1;
	// find closest building
	for (var q = 0; q < buildings.length; q++){
		if ((Math.abs((q*blockSize)+(blockSize/2)-x)<distance || distance<0) && buildings[q].getType() == buildingSearch && !buildings[q].isFull()){
			index = q;
			distance = Math.abs((q*blockSize)+(blockSize/2)-x);
		}
	}
	return index;
}
