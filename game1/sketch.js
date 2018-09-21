var canvas;
var blockSize = 32; // pixels
// all arrays
var buildings;
var people;
// currently owned
var stone = 0.0;
var wood = 50.0;
var food = 120.0;

// recieved per person working per second
var foodProduction = 0.5;
var stoneProduction = 0.5;
var woodProduction = 1.0;

// food eaten per person per second
var foodConsumption = 0.5;

var burnDamage = 4;
var burnStopChance = 0.3; // chances of a burning building to stop burning 0 - no chance, 1 - 100% chance
var buildingRegenRate = 0.5;

function setup() {
	// setup canvas
	canvas = createCanvas(640, 320);

	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);

	// assign canvas to html div
	canvas.parent("canvas-holder");

	setUpWorld(20);
}

function draw() {
	for (var q = 0; q < buildings.length; q++){
		buildings[q].draw(q*blockSize);
	}
}

function setUpWorld(worldWidth){
	buildings = [];
	people = [];
	for (var q = 0; q < worldWidth; q++){
		buildings[q] = new Building();
	}
}

function onMousePressed() {}

function needFarms(){
	return !needFarmers() && needFoodProduction();
}

function needFarmers(){
	return getBuildingsByType(3) - getPeopleByOccupation(1) < 0;
}

function needFoodProduction(){
	return getTotalFoodProduction()-getTotalFoodConsumption();
}

function needHouses(){
	return getPopulation() - getTotalHousingSpace() < 0;
}

function needForrests(){
	return !needForrestWorkers();
}

function needForrestWorkers(){
	return getBuildingsByType(6) - getPeopleByOccupation(3) < 0;
}

function needQuarries(){
	return !needQuarryWorkers();
}

function needQuarryWorkers(){
	return getBuildingsByType(5) - getPeopleByOccupation(2) < 0;
}

function getPopulation(){
	return people.length;
}

function getFarms(){
	return getBuidlingsByType(3);
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
		if (people[q].getOccupation==occ){
			sum++;
		}
	}
	return sum;
}

function getTotalHousingSpace(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType==3){
			sum+=buildings[q].getHousingSpace();
		}
	}
	return sum;
}

function getTotalFoodProduction(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType==3){
			sum+=buildings[q].getInhabitants()*foodProduction;
		}
	}
	return sum;
}

function getTotalFoodConsumption(){
	return people.length*foodConsumption;
}

//TODO
function findClosestBuilding(x, bType){}

function Person(x = 32, fname = "Akhil", age = 0){
	// head info
	this.x = x;
	this.pWidth = 16;
	this.age = age;

	/*
	0: Boy
	1: Girl
	*/
	this.sex = sex;
	this.fname = fname;

	// behind the scenes
	this.hunger = 0;
	this.horny = 0;
	/*
	0: Unemployed
	1: Farmer
	2: Quarry Worker
	3: Forrest Worker
	*/
	this.occupation = 0;
	this.speed = 32+((Math.Random*6)-3); // 32 +/- 3

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
		if (!inbuilding){
			noFill();
			stroke(30, 30, 90);
			ellipse(x, height-blockSize-32, 16, 32);
		}
	}

	this.update = function(){
		// perform objective
		switch (objectiveType){
			case 0: // roam
				// check if they have reached roaming point
				if (x < objective && x+pWidth > objective){
					newObjective();
				}
				// to the left of objective go right
				if (x < objective){
					x += (speed/frameRate);
				}
				// to the right of objective go left
				else if (x > objective){
					x -= (speed/frameRate);
				}
				break;
			case 1: // go into to building
				// check if at building door
				if (x < blockSize*objective && blockSize*objective < x+pWidth){
					if (!buildings[objective].isFull()){
						buildings[objective].addPerson();
						inBuilding = true;
						building = objective;
						objectiveType = 2;
					} 
					// building they wanted to go to is full or destroyed find a new objective
					else {
						newObjective();
					}
				} 
				// to the left and needs to go right
				else if (x+pWidth < blockSize*objective){
					x += (speed/frameRate);
				}
				// to the right and needs to go left
				else if (blockSize*(objective+1) < x){
					x -= (speed/frameRate);
				}
				break;
			case 2:
				// building destroyed
				if (buildings[building].getType==0){
					inBuilding = false;
					newObjective();
				}
				break;
		}
	}

	this.newObjective = function(){

	}

	this.getOccupation = function(){
		return occupation;
	}
}

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
	this.hp = 1.0;
	this.maxHP = 1.0;
	this.buildWood = 0; // wood needed to build
	this.buildStone = 0; // stone needed to build
	this.housingSpace = 0;
	this.inhabitants = 0; // people in building

	this.initType();

	this.initType = function(){
		switch (bType){
			case 0: // empty
				break;
			case 1: // wooden house
				this.canBurn = true;
				this.buildWood = 15;
				this.hp = 25.0;
				this.maxHP = 25.0;
				this.housingSpace = 5;
				break;
			case 2: // stone house
				this.buildStone = 15;
				this.buildWood = 5;
				this.hp = 50.0;
				this.maxHP = 50.0;
				this.housingSpace = 15;
				break;
			case 3: // farm
				this.canBurn = true;
				this.buildWood = 3;
				this.hp = 10.0;
				this.maxHP = 10.0;
				this.housingSpace = 1;
				break;
			case 4: // temple
				this.canBurn = true;
				this.buildWood = 40;
				this.buildStone = 10;
				this.hp = 30.0;
				this.maxHP = 30.0;
				break;
			case 5: // quarry
				this.buildWood = 25;
				this.hp = 15.0;
				this.maxHP = 15.0;
				this.housingSpace = 1;
				break;
			case 6: // forrest
				this.canBurn = true;
				this.hp = 15.0;
				this.maxHP = 15.0;
				this.housingSpace = 1;
				break;
		}
	}

	this.draw = function(x){
		fill(128);
		stroke(2);
		rect(x, height-blockSize-32, blockSize, blockSize);
	}

	// called 60 times a second with draw
	this.update = function(){
		// building on fire
		if (burning && canBurn){
			hp -= (burnDamage/frameRate);
		} 
		else if (hp<maxHP){
			hp += (buildingRegenRate/frameRate);
		}
		// if building destroyed
		if (hp < 0){
			this.remove();
		}
		// do not let the building go over max
		if (hp > maxHP){
			hp = maxHP;
		}
	}

	// reset to 0 or empty
	this.destroy = function(){
		resetType(0);
	}

	this.resetType = function(bType){
		this.bType = bType;
		initType();
	}

	this.isFull = function(){
		return inhabitants < housingSpace;
	}

	this.getInhabitants = function(){
		return inhabitants;
	}

	this.getHousingSpace = function(){
		return housingSpace;
	}

	this.removePerson = function(){
		inhabitants--;
	}

	this.addPerson = function(){
		inhabitants++;
	}

	this.getType = function(){
		return bType;
	}

}

/*
god powers:
lightning
disease
meteor
*/


