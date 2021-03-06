
// TODO: issue where sometimes people will both be looking for love but wont fall in love
// idk how to replicate.
var personCounter = 0;

const OCCUPATION = {
	UNEMPLOYED: 0,
	FARMER: 1,
	QUARRY_WORKER: 2,
	FORREST_WORKER: 3
}

const SEX = {
	MALE: 0,
	FEMALE: 1
}

function getSex(value){
	if (value.toLowerCase() === "female"){
		return SEX.FEMALE;
	}
	return SEX.MALE;
}

class Person{

    constructor(x = width/2, age = 0, sex = -1){
        // head info
        this.x = x;
        this.pWidth = 16;
        this.age = age;
        this.id = personCounter;
		personCounter++;
		this.hp = personHealth;
		this.hp = personHealth;

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

		switch (Math.round(Math.random())){
			case 0:
				if(this.sex == SEX.MALE){
					this.sprite = SPRITES.CHAR1_MALE;
					this.spriteFire = SPRITES.CHAR1_MALE_FIRE;
				} else {
					this.sprite = SPRITES.CHAR2_FEMALE;
					this.spriteFire = SPRITES.CHAR2_FEMALE_FIRE;
				}
				break;
			case 1:
				if (this.sex == SEX.MALE){
					this.sprite = SPRITES.CHAR2_MALE;
					this.spriteFire = SPRITES.CHAR2_MALE_FIRE;
				} else {
					this.sprite = SPRITES.CHAR2_FEMALE;
					this.spriteFire = SPRITES.CHAR2_FEMALE_FIRE;
				}
				break;
			default:
				console.log("default");
		}

        if (this.sex == SEX.MALE)
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
        this.speed = personSpeed+(Math.floor(Math.random() * personSpeedRandom)); // 32 +/- 3

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

		this.burning = false;
		
		// false when ill or on fire
		this.canWork = true;
    }

	draw(){
		if (!this.inBuilding || debugMode){
			noFill();
			stroke(30, 30, 90);
			//rect(this.x, height-blockSize-32, 16, 32);
			// how far over should the picture be moved over to get a version of the player model that fits the status
			if (this.burning){
				this.spriteFire.drawSprite(this.x,height-blockSize-blockSize,blockSize/2,blockSize);
			} else {
				this.sprite.drawSprite(this.x,height-blockSize-blockSize,blockSize/2,blockSize);
			}
		}
	}

	update(){
		if (getFrameRate() <= 5)
			return;
		// perform objective
		switch (this.objectiveType){
			case 0: // roam
				// check if they have reached roaming point
				if (this.x < this.objective && this.x+this.pWidth > this.objective){
					this.newObjective();
					break;
				}
				// to the left of objective go right
				if (this.x < this.objective){
					this.x += (this.speed/(getFrameRate()*secondsPerYear));
				}
				// to the right of objective go left
				else if (this.x > this.objective){
					this.x -= (this.speed/(getFrameRate()*secondsPerYear));
				}
				break;
			case 1: // go into to building
				// check if at building door
				if (this.x > blockSize*(this.objective) && this.x+this.pWidth < blockSize*(this.objective+1)){
					if (!buildings[this.objective].isFull()){ // TODO: Error occured here on deaths
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
					this.x += (this.speed/(getFrameRate()*secondsPerYear));
				}
				// to the right and needs to go left
				else if (this.x > blockSize*this.objective){
					this.x -= (this.speed/(getFrameRate()*secondsPerYear));
				} 
				break;
			case 2:
				// building destroyed
				if (buildings[this.building].getType()==0){
					this.inBuilding = false;
					this.newObjective();
				}
				// lover died :(
				if (this.lover != -1 && getPersonByID(this.lover) == null){
					this.resetLove();
					this.newObjective();
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
			food -= foodConsumption/(getFrameRate()*secondsPerYear);
			if (this.hunger>0){
				this.hunger -= 1/(getFrameRate()*secondsPerYear);
				if (this.hunger < 0){
					this.hunger = 0;
				}
			}
		} else {
			this.hunger += 3/(getFrameRate()*secondsPerYear);
		}
		// starvation
		if (this.hunger>=20){
			this.die("starvation");
			return;
		}
		// secondsPerYear = 5
		// secondsPerYear*fps = 1 year
		// age
		this.age += 1/(getFrameRate()*secondsPerYear);

		// die of old age
		if (this.age>=45){
			this.die("old age");
			return;
		}

		// take damage
		if (this.burning){
			this.hp -= burnDamage/(getFrameRate()*secondsPerYear);
			if (this.hp < 0){
				this.die("burns");
				return;
			}
		}

        // TODO: this is realy confusing just clean it up and check every second or something
		if (!this.lookingForLove && this.lover==-1 && repopulating){
			// love
			// 0-5% chance increase in love
			this.love += (personLove)/(getFrameRate()*secondsPerYear);
			// have love% chance - only checks once per second
			if (this.loveCheck>getFrameRate()){
				this.loveCheck=0;
				if (Math.random()*100 < this.love){
					this.lookingForLove = true;
					console.log("<Looking For Love> "+this.fname+"("+this.id+") is now looking for love");
				}
			} else {
				this.loveCheck++;
			}
		}
		// find mate
		if (this.lover==-1 && openSpaceInHouse(2) && this.lookingForLove && 
				(findClosestBuilding(this.x, BUILDING_TYPE.WOODEN_HOUSE)!=-1 || 
				findClosestBuilding(this.x, BUILDING_TYPE.STONE_HOUSE)!=-1) 
				&& !needHouses() && this.canWork && repopulating){
			if (this.findLove()){
				var index = -1;
				index = findClosestBuilding(this.x, BUILDING_TYPE.STONE_HOUSE);
				if (index==-1)
					index = findClosestBuilding(this.x, BUILDING_TYPE.WOODEN_HOUSE);
				getPersonByID(this.lover).goToBuilding(index);
				this.goToBuilding(index);
			} 
		}
	}

	leaveBuilding(){
		if (this.inBuilding){
			this.inBuilding = false;
			buildings[this.building].removePerson();
		}
	}

	resetLove(){
		this.love = 0;
		this.loveCheck = 0;
		this.lookingForLove = false;
		this.lover = -1;
	}

	newObjective(){
		this.leaveBuilding();
		var buildingSearch;
		this.occupation = 0;
		if (needFarmers()){
			this.occupation = 1;
			buildingSearch = BUILDING_TYPE.FARM;
		}
		else if (needForrestWorkers()){
			this.occupation = 3;
			buildingSearch = BUILDING_TYPE.FORREST;
		}
		else if (needQuarryWorkers()){
			this.occupation = 2;
			buildingSearch = BUILDING_TYPE.QUARRY;
		}
		// unemployed
		else {
			this.occupation = 0;
		}

		// can work
		if (!this.canWork)
			this.occupation = 0;
		
		// go to building to work
		if (buildings.length>1 && this.occupation != 0){
			this.objectiveType = 1;
			this.objective = findClosestBuilding(this.x, buildingSearch);
		}
		// roaming
		else {
			this.objectiveType = 0;
			var random = Math.random();
			this.objective = random*(blockSize*buildings.length);
		}

	}

	findLove(){
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

	setBurning(burning=true){
		this.burning = true;
		this.canWork = !burning;
	}

	takeDamage(damage, reason){
		this.hp -= damage;
		if (this.hp < 0){
			this.die(reason);
		}
	}

	getFName(){
		return this.fname;
	}

	getSex(){
		return this.sex;
	}

	getOccupation(){
		return this.occupation;
	}

	isLookingForLove(){
		return this.lookingForLove;
	}

	getID(){
		return this.id;
	}

	isInBuilding(){
		return this.inBuilding;
	}

	getBuilding(){
		return this.building;
	}

	getX(){
		return this.x;
	}

	canWork(){
		return this.canWork;
	}

	die(reason){
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
	fallInLove(id){
		if (this.lookingForLove){
			console.log("<Love> "+this.fname+"("+this.id+") has fallen in love with "+getPersonByID(id).getFName()+"("+id+")");
			this.lookingForLove = false;
			this.lover = id;
		}
	}

	goToBuilding(index){
		this.occupation = 0;
		this.leaveBuilding();
		this.objectiveType = 1;
		this.objective = index;
	}

}