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
	debugMode = false;
	// setup canvas
	canvas = createCanvas(640, 320);

	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);
	//canvas.keyReleased(onKeyReleased);
	

	// assign canvas to html div
	canvas.parent("canvas-holder");

	ss = loadImage("https://i.imgur.com/J7OFhRA.png");
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

function Person(x = 32, age = 0, sex = -1){
	// head info
	this.x = x;
	this.pWidth = 16;
	this.age = age;
	this.id = personCounter;
	personCounter++;
	this.picID = parseInt(Math.random()*2);

	/*
	0: Boy
	1: Girl
	*/
	if (sex!=1 && sex!=0){
		// https://stackoverflow.com/questions/45136711/javascript-random-generate-0-or-1-integer
		this.sex = Math.round(Math.random());
	} else {
		this.sex = sex;
	}

	if (this.sex == 0)
		this.fname = getRandomMaleName();
	else
		this.fname = getRandomFemaleName();

	console.log("<New Person> id:"+this.id + ", sex:" + this.sex+", x:"+this.x);

	// behind the scenes
	this.hunger = 0.0;
	this.love = 0.0;
	this.lookingForLove = false;
	this.loveCheck = 0;
	this.lover = -1;
	/*
	0: Unemployed
	1: Farmer
	2: Quarry Worker
	3: Forrest Worker
	*/
	this.occupation = 0;
	this.speed = 32.0+((Math.random()*7.0)-3.0); // 32 +/- 3

	/*
	Objective Types & data:
	0: roam | x
	1: go to building | building x
	2: continue work
	*/
	this.objectiveType;
	this.objective; // used as data for the objective

	this.inBuilding = false;
	this.building = 0; // index in array

	this.draw = function(){
		if (!this.inBuilding || debugMode){
			noFill();
			stroke(30, 30, 90);
			//rect(this.x, height-blockSize-32, 16, 32);
			image(ss,this.x,height-blockSize-blockSize,blockSize/2,blockSize,this.sex*16,this.picID*32+64,16,32);
		}
	}

	this.update = function(){
		if (getFrameRate() == 0)
			return;
		// perform objective
		switch (this.objectiveType){
			case 0: // roam
				// check if they have reached roaming point
				if (this.x < this.objective && this.x+this.pWidth > this.objective){
					this.newObjective();
				}
				// to the left of objective go right
				if (this.x < this.objective){
					this.x += (this.speed/getFrameRate());
				}
				// to the right of objective go left
				else if (this.x > this.objective){
					this.x -= (this.speed/getFrameRate());
				}
				break;
			case 1: // go into to building
				// check if at building door
				if (this.x > blockSize*(this.objective) && this.x+this.pWidth < blockSize*(this.objective+1)){
					if (!buildings[this.objective].isFull()){
						buildings[this.objective].addPerson();
						this.inBuilding = true;
						this.building = this.objective;
						this.objectiveType = 2;
					} 
					// building they wanted to go to is full or destroyed find a new objective
					else {
						this.newObjective();
					}
				}
				// to the left and needs to go right
				else if (this.x+this.pWidth < blockSize*(this.objective+1)){
					this.x += (this.speed/getFrameRate());
				}
				// to the right and needs to go left
				else if (this.x > blockSize*this.objective){
					this.x -= (this.speed/getFrameRate());
				} 
				break;
			case 2:
				// building destroyed
				if (buildings[this.building].getType()==0){
					this.inBuilding = false;
					this.newObjective();
				}
				// lover died :(
				if (this.lover!=-1 && getPersonByID(this.lover)==null){
					this.lover = -1;
				}
				// lover in house
				if (this.lover != -1 && getPersonByID(this.lover).isInBuilding() && getPersonByID(this.lover).getBuilding() == this.building){
					people[people.length] = new Person(this.x);
					getPersonByID(this.lover).resetLove();
					getPersonByID(this.lover).newObjective();
					this.resetLove();
					this.newObjective();
				}
				break;
			default:
				this.newObjective();
				break;
		}
		// food consumption
		if (food>1){
			food -= foodConsumption/getFrameRate();
			if (this.hunger>0){
				this.hunger -= 1/getFrameRate();
				if (this.hunger < 0){
					this.hunger = 0;
				}
			}
		} else {
			this.hunger += 1/getFrameRate();
		}
		// starvation
		if (this.hunger>=20){
			this.die("starvation");
		}

		// age
		this.age += yearsPerSecond/getFrameRate();

		// die of old age
		if (this.age>=80){
			this.die("old age");
		}

		if (!this.lookingForLove && this.lover==-1){
			// love
			// 0-5% chance increase in love
			this.love += (Math.random()*5)/getFrameRate();
			// 40% chance potentially fall in love + also have love% chance - only checks once per second
			if (this.loveCheck>getFrameRate()){
				this.loveCheck=0;
				if (Math.random()<.4 && Math.random()*100 < this.love){
					this.lookingForLove = true;
					console.log("<Looking For Love> "+this.fname+"("+this.id+") is now looking for love");
				}
			} else {
				this.loveCheck++;
			}
		}
		// find mate
		if (this.lover==-1 && openSpaceInHouses() && this.lookingForLove && (findClosestBuilding(this.x, 1)!=-1 || findClosestBuilding(this.x, 2)!=-1)){
			if (this.findLove()){
				var index = -1;
				index = findClosestBuilding(this.x, 1);
				if (index==-1)
					index = findClosestBuilding(this.x, 2);
				getPersonByID(this.lover).goToBuilding(index);
				this.goToBuilding(index);
			}
		}
	}

	this.leaveBuilding = function(){
		if (this.inBuilding){
			this.inBuilding = false;
			buildings[this.building].removePerson();
		}
	}

	this.resetLove = function(){
		this.love = 0;
		this.loveCheck = 0;
		this.lookingForLove = false;
		this.lover = -1;
	}

	this.newObjective = function(){
		this.leaveBuilding();
		var buildingSearch = 0;
		this.occupation = 0;
		if (needFarmers()){
			console.log(getPeopleByOccupation(1));
			this.occupation = 1;
			buildingSearch = 3;
		}
		else if (needForrestWorkers()){
			this.occupation = 3;
			buildingSearch = 6;
		}
		else if (needQuarryWorkers()){
			this.occupation = 2;
			buildingSearch = 5;
		}
		// unemployed
		else {
			this.occupation = 0;
		}
		
		// go to building to work
		if (buildings.length>1 && this.occupation != 0){
			this.objectiveType = 1;
			this.objective = findClosestBuilding(this.x, buildingSearch);
		}
		// roaming
		else {
			this.objectiveType = 0;
			this.objective = Math.random()*(blockSize*buildings.length);
		}

	}

	this.findLove = function(){
		for (var q = 0; q < people.length; q++){
			if (people[q].getSex()!=this.sex && people[q].isLookingForLove() && this.id != people[q].getID()){
				this.lover = people[q].getID();
				this.lookingForLove = false;
				getPersonByID(this.lover).fallInLove(this.id);
				return true;
			}
		}
		return false;
	}

	this.getFName = function(){
		return this.fname;
	}

	this.getSex = function(){
		return this.sex;
	}

	this.getOccupation = function(){
		return this.occupation;
	}

	this.isLookingForLove = function(){
		return this.lookingForLove;
	}

	this.getID = function(){
		return this.id;
	}

	this.isInBuilding = function(){
		return this.inBuilding;
	}

	this.getBuilding = function(){
		return this.building;
	}

	this.die = function(reason){
		if (this.inBuilding){
			buildings[this.building].removePerson();
		}
		console.log(this.fname+" died at the age of " + parseInt(this.age) + " from " + reason);
		var index = -1;
		for (var q = 0; q < people.length; q++){
			if (people[q].getID() == this.id){
				index = q;
				break;
			}
		}
		people.splice(index, 1);
	}

	// called when someone else has decided to be this persons lover
	this.fallInLove = function(id){
		if (this.lookingForLove){
			console.log("<Love> "+this.fname+"("+this.id+") has fallen in love with "+getPersonByID(id).getFName()+"("+id+")");
			this.lookingForLove = false;
			this.lover = id;
		}
	}

	this.goToBuilding = function(index){
		this.occupation = 0;
		this.leaveBuilding();
		this.objectiveType = 1;
		this.objective = index;
	}
}

var WOODEN_HOUSE = {bType:1, wood:15, stone:0};
var STONE_HOUSE = {bType:2, wood:5, stone:15};
var FARM = {bType:3, wood:3, stone:0};
var TEMPLE = {bType:4, wood:10, stone:40};
var QUARRY = {bType:5, wood:25, stone:0};
var FORREST = {bType:6, wood:0, stone:0};

function Building(bType = 0, burning = false){
	/*
	Types:
	0: Empty
	1: Wodden House -> reproduce
	2: Stone House -> reproduce
	3: Farm -> gain food
	4: Temple -> idk
	5: Quarry -> gain stone
	6: Forrest -> gain wood
	*/
	this.bType = bType;
	this.burning = burning;

	this.canBurn = false;
	this.hp = 0.0;
	this.maxHP = 1.0;
	this.housingSpace = 0;
	this.inhabitants = 0; // people in building
	this.ssX = 6;
	this.ssY = 0;

	this.initType = function(){
		switch (this.bType){
			case 0: // empty
				break;
			case 1: // wooden house
				this.ssX = 1;
				this.ssY = 0;
				this.canBurn = true;
				this.hp = 25.0;
				this.maxHP = 25.0;
				this.housingSpace = 3;
				break;
			case 2: // stone house
				this.ssX = 5;
				this.ssY = 0;
				this.hp = 50.0;
				this.maxHP = 50.0;
				this.housingSpace = 15;
				break;
			case 3: // farm
				this.ssX = 3;
				this.ssY = 0;
				this.canBurn = true;
				this.hp = 10.0;
				this.maxHP = 10.0;
				this.housingSpace = 1;
				break;
			case 4: // temple
				this.canBurn = true;
				this.hp = 30.0;
				this.maxHP = 30.0;
				break;
			case 5: // quarry
				this.ssX = 4;
				this.ssY = 0;
				this.hp = 15.0;
				this.maxHP = 15.0;
				this.housingSpace = 1;
				break;
			case 6: // forrest
				this.ssX = 2;
				this.ssY = 0;
				this.canBurn = true;
				this.hp = 15.0;
				this.maxHP = 15.0;
				this.housingSpace = 1;
				break;
		}
	}

	this.initType();

	this.draw = function(x){
		// https://github.com/processing/p5.js/issues/1567
		fill(128, 128, 128, 128);
		stroke(2);
		// the +1 and having the width of 30 is because p5.js is stoopid
		image(ss,x,height-blockSize*2,blockSize,blockSize,this.ssX*32+1,this.ssY*32,30,32);
	}

	// called 60 times a second with draw
	this.update = function(){
		if (getFrameRate() == 0)
			return;
		// building on fire
		if (this.burning && this.canBurn){
			this.hp -= (this.burnDamage/getFrameRate());
		} 
		else if (this.hp<this.maxHP){
			this.hp += (this.buildingRegenRate/getFrameRate());
		}
		// if building destroyed
		if (this.hp < 0){
			this.remove();
		}
		// do not let the building go over max
		if (this.hp > this.maxHP){
			this.hp = this.maxHP;
		}
		// production
		switch (this.bType){
			case 3:
				food += (foodProduction*this.inhabitants)/getFrameRate();
				break;
			case 5:
				stone += (stoneProduction*this.inhabitants)/getFrameRate();
				break;
			case 6:
				wood += (woodProduction*this.inhabitants)/getFrameRate();
				break;
		}
	}

	// reset to 0 or empty
	this.destroy = function(){
		this.resetType(0);
	}

	this.resetType = function(bType){
		this.bType = bType;
		this.initType();
	}

	this.isFull = function(){
		return this.inhabitants >= this.housingSpace;
	}

	this.getInhabitants = function(){
		return this.inhabitants;
	}

	this.getHousingSpace = function(){
		return this.housingSpace;
	}

	this.removePerson = function(){
		this.inhabitants--;
	}

	this.addPerson = function(){
		this.inhabitants++;
	}

	this.getType = function(){
		return this.bType;
	}

}

/*
god powers:
lightning
disease
meteor
*/


