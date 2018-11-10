
class Weather {

    constructor(name, temp){
        this.name = name;
        this.temp = temp;
        this.foodProductionMultiplier = 1;
        this.lighting = 1; // dark & light
        this.foodConsumptionMultiplier = 1;
        this.burnDamageMultiplier = 1;
        this.stoneProductionMultiplier = 1;
        this.woodPorductionMultiplier = 1;
    }

    update(){}
    draw(){}

    getName(){
        return this.name;
    }

    getTemperature(){
        return this.temp;
    }

    getBurnDamageMultiplier(){
        return this.burnDamageMultiplier;
    }

    getFoodProductionMultiplier(){
        return this.foodProductionMultiplier;
    }

    getWoodProductionMultiplier(){
        return this.woodPorductionMultiplier;
    }

    getStoneProductionMultiplier(){
        return this.stoneProductionMultiplier;
    }

    getFoodConsumptionMultiplier(){
        return this.foodConsumptionMultiplier;
    }

    getLighting(){
        return this.lighting;
    }

}

/**
 * increases the food gained from farms.
 */
class RainFall extends Weather {
    constructor(params){
        super("Rainfall", 70);
        this.foodProductionMultiplier = 2;
        this.lighting = .65;
        this.rainCounter = new AnimatedSpriteCounter(.5, SPRITES.RAIN_STRAIGHT.imageLength());
    }

    draw(){
        for (var r = 0; r < width/blockSize; r++){
            for (var c = 0; c < height/blockSize-1; c++){
                SPRITES.RAIN_STRAIGHT.drawSprite(r*blockSize, c*blockSize, blockSize, blockSize, this.rainCounter.getIndex(running));
            }
        }
    }
}

/**
 * increases the food gained from farms, and has lightning.
 */
class RainStorm extends Weather {
    constructor(params){
        super("Rain Storm", 70);
        this.foodProductionMultiplier = 2;
        this.lighting = .65;
        this.strikes = params[0];
        if (this.strikes<=0)
            return;
        this.interval = 1/this.strikes;
        this.lastStrike = -1;
        this.bolts = [];
        this.rainCounter = new AnimatedSpriteCounter(1, SPRITES.RAIN_STRAIGHT.imageLength());
    }

    newBolt(){
        this.bolts[this.bolts.length] = new Bolt(width*Math.random());
    }

    update(){
        if (this.lastStrike<0)
            this.lastStrike = gameYear;
        for(var q = 0; q < this.bolts.length; q++){
            if (this.bolts[q].isAnimationOver()){
                this.bolts.splice(q, 1);
                q--;
            }
        }
        while (gameYear-this.lastStrike>=this.interval){
            this.lastStrike += this.interval;
            this.newBolt();
        }
    }

    draw(){
        for(var q = 0; q < this.bolts.length; q++){
            this.bolts[q].draw();
        }
        for (var r = 0; r < width/blockSize; r++){
            for (var c = 0; c < height/blockSize-1; c++){
                SPRITES.RAIN_STRAIGHT.drawSprite(r*blockSize, c*blockSize, blockSize, blockSize, this.rainCounter.getIndex(running));
            }
        }
    }
}

/**
 * for RainStorm class.
 */
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
        var groundY = height/32-2
        for (var q = 0; q < groundY+1; q++){
            if (this.direction == 0){ // left
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

/**
 * no food can be gained from farms.
 */
class Snow extends Weather {
    constructor(params){
        super("Snow", 70);
        this.foodProductionMultiplier = 0;
        this.snowCounter = new AnimatedSpriteCounter(.06, SPRITES.SNOW_STRAIGHT.imageLength());
        this.snowCounter.setSpeed(.04);
    }

    draw(){
        for (var r = 0; r < width/blockSize; r++){
            for (var c = 0; c < height/blockSize-1; c++){
                SPRITES.SNOW_STRAIGHT.drawSprite(r*blockSize, c*blockSize, blockSize, blockSize, this.snowCounter.getIndex(running));
            }
        }
    }

}

/**
 * no food can be gained from farms, and temperature get dangerously low.
 */
class Blizzard extends Weather {
    constructor(params){
        super("Blizzard", 70);
        this.foodProductionMultiplier = 0;
        this.foodConsumptionMultiplier = 3;
        this.lighting = .65;
        this.snowCounter = new AnimatedSpriteCounter(.06, SPRITES.SNOW_STRAIGHT.imageLength());
        this.snowCounter.setSpeed(.07);
    }

    draw(){
        for (var r = 0; r < width/blockSize; r++){
            for (var c = 0; c < height/blockSize-1; c++){
                SPRITES.SNOW_STRAIGHT.drawSprite(r*blockSize, c*blockSize, blockSize, blockSize, this.snowCounter.getIndex(running));
            }
        }
    }
}

/**
 * no effect
 */
class NormalWeather extends Weather {

    constructor(params){
        super("Normal", 70);
    }



}

/**
 * temperature gets dangerously high
 */
class HeatWave extends Weather {

}

function getWeather(value, params){
    switch(value.toLowerCase()){
        case "blizzard":
            return new Blizzard(params);
            break;
        case "rainstorm":
            return new RainStorm(params);
            break;
        case "snow":
            return new Snow(params);
            break;
        case "blizzard":
            return new Blizzard(params);
            break;
        case "rainfall":
            return new RainFall(params);
            break;
        default: // normal weather
            return new NormalWeather(params);
    }
}
