
class GodPower{

    constructor(spriteActive, spriteUnactive){
        this.spriteActive = spriteActive;
        this.spriteUnactive = spriteUnactive;
        this.active = false;
    }

    keyPressed(key){}
    mouseClicked(){}
    update(){}
    draw(){}

    toggleActivation(){
        this.active = !this.active;
    }

    getSpriteActive(){
        return this.spriteActive;
    }

    getSpriteUnactive(){
        return this.spriteUnactive;
    }

    isActive(){
        return this.active;
    }

}

class Lightning extends GodPower{
    
    constructor(){
        super(SPRITES.LIGHTNING_POWER_ACTIVE, SPRITES.LIGHTNING_POWER_UNACTIVE);

        this.bolts = [];

    }

    update(){
        for(var q = 0; q < this.bolts.length; q++){
            if (this.bolts[q].isAnimationOver()){
                this.bolts.splice(q, 1);
                q--;
            }
        }
    }

    draw(){
        for(var q = 0; q < this.bolts.length; q++){
            this.bolts[q].draw();
        }
    }

    mouseClicked(){
        this.bolts[this.bolts.length] = new Bolt(mouseX);
    }

}

class Bolt{
    constructor(x){
        this.animationTime = .5; // seconds
        this.animationStartTime = new Date().getTime();
        this.x = x;
        // 0: left, 1: right
        this.direction  = Math.round(Math.random());; // coming from right or left
        explosion(x, 16, 5, 5, "lightning");
    }

    draw(){
        var groundY = getGameHeight()/32-2
        for (var q = 0; q < groundY+1; q++){
            if (this.direction == 0){ // left
                //console.log("left");
                SPRITES.LIGHTNING_LEFT.drawSprite(this.x-16*q, 32*groundY-(q)*32, 16, 32);
            }
            if (this.direction == 1) // right
                SPRITES.LIGHTNING_RIGHT.drawSprite(this.x+16*q, 32*groundY-q*32, 16, 32);
        }
    }

    isAnimationOver(){
        return new Date().getTime()-this.animationStartTime>this.animationTime*1000;
    }
}

class Sun extends GodPower{
    constructor(){
        super(SPRITES.SUN_POWER_ACTIVE, SPRITES.SUN_POWER_UNACTIVE);
        this.maxInterval = 5;
        this.minInterval = 1;
        this.nextBurn = 0;
    }

    setNextBurnTime(){
        // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
        this.nextBurn = new Date().getTime()+Math.floor(Math.random() * ((this.maxInterval*1000) - (this.minInterval*1000) + 1)) + (this.minInterval*1000);
    }

    update(){
        // no immediate burn after setting to active or opening.
        if (!this.active){
            this.nextBurn = 0;
        }
        if (this.active && this.nextBurn == 0){
            this.setNextBurnTime();
            console.log("new burn");
        }
        if (new Date().getTime() >= this.nextBurn && this.active){
            // burn
            console.log(getBuildingsNotByType(BUILDING_TYPE.EMPTY));
            var index = Math.floor(Math.random() * (people.length+getBuildingsNotByType(BUILDING_TYPE.EMPTY)));
            if (index<people.length){
                people[index].setBurning(true);
            } else {
                var subIndex = 0;
                for (var q = 0; q < buildings.length; q++){
                    if (buildings[q].getType()!=BUILDING_TYPE.EMPTY){
                        if (index-people.length==subIndex){
                            burnBuilding(q);
                            break;
                        }
                        subIndex++;
                    }
                }
            }
            this.setNextBurnTime();
        }
    }
}

class SpawnPerson extends GodPower{
    constructor(){
        super(SPRITES.SUN_POWER_ACTIVE, SPRITES.SUN_POWER_UNACTIVE);
    }

    mouseClicked(){
        people[people.length] = new Person(mouseX);
    }
}

/* 
Other Ideas:
Plague
Good Harvest / give resources
Fire
meteor
acid rain
spawn more people
*/
