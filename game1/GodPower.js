
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
        this.setNextBurnTime();
    }

    setNextBurnTime(){
        // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
        this.nextBurn = new Date().getTime()+Math.floor(Math.random() * ((this.maxInterval*1000) - (this.minInterval*1000) + 1)) + (this.minInterval*1000);
    }

    update(){
        if (new Date().getTime() >= this.nextBurn && this.active){
            // burn
            // TODO: random person or building need to find random building that isnt empty tho.
            var index = Math.floor(Math.random() * (people.length));
            if (index<people.length){
                people[index].setBurning(true);
            } else {
                //burnBuilding();
            }
            this.setNextBurnTime();
        }
    }
}

/*
[1, 2, 3, 4]
[1, 2]

Length: 4
*/

/* 
Other Ideas:
Plague
Good Harvest / give resources
Fire
meteor
acid rain
spawn more people
*/
