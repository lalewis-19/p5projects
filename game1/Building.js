console.log("loaded building file");


/*
var WOODEN_HOUSE = {bType:1, wood:15, stone:0};
var STONE_HOUSE = {bType:2, wood:5, stone:15};
var FARM = {bType:3, wood:3, stone:0};
var TEMPLE = {bType:4, wood:10, stone:40};
var QUARRY = {bType:5, wood:25, stone:0};
var FORREST = {bType:6, wood:0, stone:0};
*/
const BUILDING_TYPE = {
    EMPTY: {
        id: 0,
        stoneCost: 0,
        woodCost: 0,
        canBurn: false,
        hp: 0,
		hs: 0,
		sprite: SPRITES.GRASS
    },
    WOODEN_HOUSE : {
        id: 1,
        stoneCost: 0,
        woodCost: 15,
        canBurn: true,
        hp: 25.0,
		hs: 3,
		sprite: SPRITES.WOODEN_HOUSE
    },
    STONE_HOUSE : {
        id: 2,
        stoneCost: 15,
        woodCost: 5,
        canBurn: false,
        hp: 50.0,
		hs: 15,
		sprite: SPRITES.STONE_HOUSE
    },
    FARM : {
        id: 3,
        stoneCost: 0,
        woodCost: 3,
        canBurn: true,
        hp: 10.0,
		hs: 1,
		sprite: SPRITES.FARM
    },
    QUARRY : {
        id: 4,
        stoneCost: 0,
        woodCost: 25,
        canBurn: true,
        hp: 15.0,
		hs: 1,
		sprite: SPRITES.QUARRY
    },
    FORREST : {
        id: 5,
        stoneCost: 0,
        woodCost: 0,
        canBurn: true,
        hp: 15.0,
		hs: 1,
		sprite: SPRITES.FORREST
    }
}

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

class Building{

    constructor(buildingStats = BUILDING_TYPE.EMPTY){
		this.buildingStats = buildingStats;
        this.burning = false;

        this.hp = buildingStats.hp;
        this.inhabitants = 0; // people in building

		// false when on fire or blocked
		this.useable = true;
    }


	draw(x){
		// https://github.com/processing/p5.js/issues/1567
		fill(128, 128, 128, 128);
		stroke(2);
		// the +1 and having the width of 30 is because p5.js is stoopid
		this.buildingStats.sprite.drawSprite(x, getGameHeight()-blockSize*2,blockSize,blockSize);
		if (this.burning){
			SPRITES.BUILDING_FIRE.drawSprite(x, getGameHeight()-blockSize*2, blockSize, blockSize);
		}
	}

	// called 60 times a second with draw
	update(){
		if (getFrameRate() == 0)
			return;
		// building on fire
		if (this.burning && this.canBurn){
			this.hp -= (burnDamage/(getFrameRate()*secondsPerYear));
		} 
		else if (this.hp<this.maxHP){
			this.hp += (this.buildingRegenRate/(getFrameRate()*secondsPerYear));
		}
		// if building destroyed
		if (this.hp < 0 && this.buildingStats != BUILDING_TYPE.EMPTY){
			this.destroy();
		}
		// do not let the building go over max
		if (this.hp > this.buildingStats.hp){
			this.hp = this.buildingStats.hp;
		}
		// production
		switch (this.buildingStats){
			case BUILDING_TYPE.FARM:
				food += (foodProduction*this.inhabitants)/(getFrameRate()*secondsPerYear);
				break;
			case BUILDING_TYPE.QUARRY:
				stone += (stoneProduction*this.inhabitants)/(getFrameRate()*secondsPerYear);
				break;
			case BUILDING_TYPE.FORREST:
				wood += (woodProduction*this.inhabitants)/(getFrameRate()*secondsPerYear);
				break;
		}
	}

	takeDamage(damage){
		this.hp -= damage;
	}

	setBurning(burning = true){
		if (!this.canBurn)
			return;
		this.burning = burning;
		this.useable = !burning;
	}

	// reset to 0 or empty
	destroy(){
		this.resetType(BUILDING_TYPE.EMPTY);
	}

	resetType(buildingStats){
		this.buildingStats = buildingStats;
		this.burning = false;
        this.hp = this.buildingStats.hp;
        this.inhabitants = 0; 
	}

	isFull(){
		return this.inhabitants >= this.buildingStats.hs;
	}

	getInhabitants(){
		return this.inhabitants;
	}

	getHousingSpace(){
		return this.buildingStats.hs;
	}

	getEmptySpace(){
		return this.getHousingSpace()-this.getInhabitants();
	}

	removePerson(){
		this.inhabitants--;
	}

	addPerson(){
		this.inhabitants++;
	}

	getType(){
		return this.buildingStats;
	}

	isUseable(){
		return this.useable;
	}

	canBurn(){
		return this.buildingStats.canBurn;
	}

}