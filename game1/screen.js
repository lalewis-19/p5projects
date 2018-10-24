class SketchScreenManager {
	constructor(){
		this.screens = [];
    }
    draw(){
        for (var q = 0; q < this.screens.length; q++){
            if (this.screens[q].isVisible())
                this.screens[q].draw();
		}
    }
	onMouseReleased(){
		for (var q = 0; q < this.screens.length; q++){
			this.screens[q].onMouseReleased();
		}
	}
	onKeyReleased(){
		for (var q = 0; q < this.screens.length; q++){
			this.screens[q].onKeyReleased();
		}
    }
    addScreen(screen){
        this.screens[this.screens.length] = screen;
    }
	getScreens(){
		return this.screens;
	}
	openScreen(screen){
		for (var q = 0; q < this.screens.length; q++){
			if (this.screens[q] instanceof screen){
				this.screens[q].open();
			}
		}
	}
}

class SketchScreen{
	constructor(){
		this.attention = false;
        this.entities = [];
        this.visible = false;
	}
	onMouseReleased(){
		if (this.attention){
			for (var q = 0; q < this.entities.length; q++){
				this.entities[q].onMouseReleased(this);
			}
		}
	}
	onKeyReleased(){
		if (this.attention){
			for (var q = 0; q < this.entities.length; q++){
				this.entities[q].onKeyReleased(this);
			}
		}
    }
    draw(){}
	setAttention(attention){
		this.attention = attention;
	}
	hasAttention(){
		return this.attention;
    }
    setVisible(visible){
        this.visible = visible;
    }
    addEntity(entity){
        this.entities[this.entities.length] = entity;
    }
    isVisible(){
        return this.visible;
    }
	getEntities(){
		return this.entities;
	}
	close(){
		this.visible = false;
		this.attention = false;
	}
	open(){
		this.visible = true;
		this.attention = true;
	}
	moveButtons(x, y){
		for (var q = 0; q < this.entities.length; q++){
			this.entities[q].x += x;
			this.entities[q].y += y;
		}
	}
}

class SketchButton {

	constructor(onClick, x, y, w, h, key){
		this.onClick = onClick;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.key = key;
	}

	onMouseReleased(screen){
		if (this.x <= mouseX && mouseX <= this.x + this.width &&
				this.y <= mouseY && mouseY <= this.y + this.height)
			this.onClick(screen);
	}

	onKeyReleased(screen){
		if (this.key!=null && keyCode==this.key)
			this.onClick(screen);
	}

}

class CenteredPopUpScreen extends SketchScreen {
	constructor(w, h, bColor, fColor, exitButton = false){
		super();
		this.w = w;
		this.h = h;
		this.x = width/2-w/2;
		this.y = height/2-h/2;
		this.bColor = bColor;
		this.fColor = fColor;
		this.exitButton = exitButton;
		this.buttonW = 20, this.buttonH = 15;
		if (exitButton){
			this.addEntity(new SketchButton(function(screen) {
				screen.close();
			}, this.x+this.w-2-this.buttonW, this.y+2, this.buttonW, this.buttonH, 27));
		}
	}
	draw(){
		fill(this.bColor);
		rect(this.x, this.y, this.w, this.h);
		if (this.exitButton){
			stroke(this.fColor);
			noFill();
			rect(this.x+this.w-2-this.buttonW, this.y+2, this.buttonW, this.buttonH);
			line(this.x+this.w-2-this.buttonW, this.y+2, this.x+this.w-2, this.y+2+this.buttonH);
			line(this.x+this.w-2-this.buttonW, this.y+2+this.buttonH, this.x+this.w-2, this.y+2);
		}
	}
}

class HUD extends SketchScreen {
    constructor(){
        super();
        this.visible = true;
		this.attention = true;
		this.addEntity(new SketchButton(function(screen) {
			screenManager.openScreen(GlobalInfo);
		},width-100, getGameHeight()+15, 100, hudHeight, 71));
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
		for (var q = 0; q < godPowers.length; q++){
			let index = q.valueOf();
			var callback = function(screen) {
				getGodPower(godPowers[index].constructor.name).toggleActivation();
			}
			this.addEntity(new SketchButton(callback, q * 48 +16, getGameHeight()+hudHeight/2-16, 32, 32, 49+q));
		}
    }

    draw(){
        // TODO: draw lightning
		for (var q = 0; q < godPowers.length; q++){
			if (godPowers[q].isActive()){
				godPowers[q].getSpriteActive().drawSprite(q * 48 +16, getGameHeight()+hudHeight/2-16, 32, 32);
			} else {
				godPowers[q].getSpriteUnactive().drawSprite(q * 48 +16, getGameHeight()+hudHeight/2-16, 32, 32);
			}
		}
        // draw global info: pop, food, wood, stone
        textAlign(LEFT);
        textSize(12);
		fill(0);
		noStroke();
        text("Population: " + parseInt(getPopulation()), width-100, getGameHeight()+15*1);
        text("Wood: " + parseInt(wood), width-100, getGameHeight()+15*2);
		text("Stone: " + parseInt(stone), width-100, getGameHeight()+15*3);
        text("Food: " + parseInt(food), width-100, getGameHeight()+15*4);
        
        if (debugMode){
			fill(255);
			stroke(0);
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

class GlobalInfo extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30;
		this.y -= offset;
		this.moveButtons(0, -offset);
	}

	draw(){
		stroke(1);
		super.draw();
		// setup text
		textAlign(LEFT);
        textSize(12);
		fill(0);
		noStroke();
		// population
		text("Females: " + getPopulationBySex(SEX.FEMALE), this.x+5, this.y+15);
		text("Males: " + getPopulationBySex(SEX.MALE), this.x+5, this.y+15*2);
		text("Total Population: " + getPopulation(), this.x+5, this.y+15*3);
		// food
		text("Food: " + parseInt(food), this.x+5, this.y+15*4);
		text("Food Production: " + getCurrentFoodProduction() + "/" + getTotalFoodProduction(), this.x+5, this.y+15*5);
		text("Food Consumtion: " + getTotalFoodConsumption(), this.x+5, this.y+15*6);
		// wood
		text("Wood: " + parseInt(wood), this.x+5, this.y+15*7);
		// stone
		text("Stone: " + parseInt(stone), this.x+5, this.y+15*8);
	}
}

class Tutorial1 extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30
		this.y -= offset;
		this.moveButtons(0, -offset);
		this.visible = true;
		this.attention = true;
	}
	draw(){
		stroke(1);
		super.draw();
		noStroke();
	}
}
