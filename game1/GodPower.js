
class GodPower{

    constructor(){
        this.active = false;
    }

    keyPressed(key){}
    mouseClicked(){}
    update(){}
    draw(){}

    isActive(){
        return this.active;
    }

}

class Lightning extends GodPower{
    
    constructor(){
        super();

        this.active = true;
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
                image(ss, this.x-16*q, 32*groundY-(q)*32, 16, 32, 32+16, 33, 16, 30);
            }
            if (this.direction == 1) // right
                image(ss, this.x+16*q, 32*groundY-q*32, 16, 32, 32, 33, 16, 30);
        }
    }

    isAnimationOver(){
        return new Date().getTime()-this.animationStartTime>this.animationTime*1000;
    }
}

class Sun extends GodPower{

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
