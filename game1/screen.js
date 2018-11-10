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
		var attention = [];
		for (var q = 0; q < this.screens.length; q++){
			if (this.screens[q].hasAttention()){
				attention[q] = true;
			} else {
				attention[q] = false;
			}
		}
		for (var q = 0; q < this.screens.length; q++){
			if (attention[q])
				this.screens[q].onMouseReleased();
		}
	}
	onKeyReleased(){
		var attention = [];
		for (var q = 0; q < this.screens.length; q++){
			if (this.screens[q].hasAttention()){
				attention[q] = true;
			} else {
				attention[q] = false;
			}
		}
		for (var q = 0; q < this.screens.length; q++){
			if (attention[q])
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
		},width-100, getGameHeight()+15, 100, hudHeight, 71)); // g
		this.addEntity(new SketchButton(function(screen) {
			toggleSpeed();
		}, width-136, getGameHeight()+4, 24, 24, null));
		this.addEntity(new SketchButton(function(screen) {
			if (running){
				pause();
			} else {
				resume();
			}
		}, width-136, getGameHeight()+12+24, 24, 24, null));
		this.addEntity(new SketchButton(function(screen) {
			screenManager.openScreen(Tutorial1);
		}, width-34, 2, 32, 32, 72)); // h
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
    }

    draw(){
		// year
		fill(99,83,32);
		stroke(0);
		var sideLength = 32;
		rect(width/2-sideLength, 0, sideLength*2, 32);
		textAlign(CENTER);
		textSize(20);
		fill(255);
		stroke(0);
		text("YEAR", width/2, 16);
		text(""+parseInt(gameYear), width/2, 30);
		textAlign(LEFT);
		SPRITES.HELP.drawSprite(width-34, 2, 32, 32);
		// draw god powers
		fill(0);
		noStroke();
		textSize(16);
		text("God Powers", 8, getGameHeight()+16);
        // draw global info: pop, food, wood, stone
        textSize(14);
		fill(0);
		noStroke();
		var difference = 14;
        text("Population: " + parseInt(getPopulation()), width-100, getGameHeight()+difference*1);
        text("Wood: " + parseInt(wood), width-100, getGameHeight()+difference*2);
		text("Stone: " + parseInt(stone), width-100, getGameHeight()+difference*3);
		text("Food: " + parseInt(food), width-100, getGameHeight()+difference*4);
		
		stroke(0);
		noFill();
		rect(width-136, getGameHeight()+4, 24, 24);
		rect(width-136, getGameHeight()+12+24, 24, 24);
		fill(0);
		noStroke();
		textAlign(CENTER);
		textSize(22);
		text(speeds[speedIndex].name, width-136+12, getGameHeight()+4+24-4);
		if (running){
			SPRITES.PAUSE.drawSprite(width-136, getGameHeight()+12+24, 24, 24);
		} else {
			SPRITES.RESUME.drawSprite(width-136, getGameHeight()+12+24, 24, 24);
		}
        
        if (debugMode){
			fill(255);
			stroke(0);
			textAlign(LEFT);
			textSize(12);
			text("needFarms:"+needFarms()+",needHouses:"+needHouses()
				+",needForrest:"+needForrests()+",needQuarries:"+needQuarries(), 20, 64);

			var occ = "";
			for (var q = 0; q < people.length; q++){
				occ += people[q].getOccupation()+",";
			}
			text("occupations:"+occ, 20, 80);
			text("year: " + parseInt(gameYear), 20, 96);
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

/*
Tutorial Script
Name: peasant village
tutorial script:
Welcome to peasant village! In this game you are a god who can control a village
of peasants. In this tutorial we will go over some of the controls of the game.

buildings:
There are three main resources: food, wood, and stone. Wood and stone are building materials 
that are required to build. Food is consumed by the peasants so they do not die of starvation.
The village will produce these resources as long as a peasant is occupying the right building.
Farms produce food, forrests produce wood, quarries produce stone. Wooden and stone houses 
do not produce any resources, although they do increase the housing space of the vilage and 
are required for reproduction.

You can gain more insight on the resource production and population by pressing g or click on 
the values displayed in the lower right corner.

You can use the god powers in the lower left corner by activating them (which will make the icon glow up)
and then by clicking on the map. You can also press the number assigned to the god power.

You can control the speed of time and pause/resume the game in the lower right corner.
*/

class Tutorial1 extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30
		this.y -= offset;
		this.addEntity(new SketchButton(function(screen) {
			screenManager.openScreen(Tutorial2);
			screen.close();
		},this.x, this.y, this.w-this.buttonW, this.h, 13)); // enter
		this.moveButtons(0, -offset);
	}
	draw(){
		stroke(1);
		super.draw();
		noStroke();
		textSize(12);
		fill(0);
		textAlign(LEFT);
		var message = "Welcome to peasant village! In this game you are a god who can control a village of peasants. "
				+"In this tutorial we will go over some of the controls of the game. Press Enter to continue.";
		text(message, this.x+2, this.y+6, this.w-this.buttonW, this.h);
	}
}

class Tutorial2 extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30
		this.y -= offset;
		this.addEntity(new SketchButton(function(screen) {
			screenManager.openScreen(Tutorial3);
			screen.close();
		},this.x, this.y, this.w-this.buttonW, this.h, 13)); // enter
		this.moveButtons(0, -offset);
	}
	draw(){
		stroke(1);
		super.draw();
		noStroke();
		textSize(12);
		fill(0);
		textAlign(LEFT);
		var message = "There are three main resources: food, wood, and stone. Wood and stone are building materials " +
				"that are required to build. Food is consumed by the peasants so they do not die of starvation. " +
				"The village will produce these resources as long as a peasant is occupying the right building. " +
				"Farms produce food, forrests produce wood, quarries produce stone. Press Enter to continue.";
		text(message, this.x+2, this.y+6, this.w-this.buttonW, this.h);
	}
}

class Tutorial3 extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30
		this.y -= offset;
		this.addEntity(new SketchButton(function(screen) {
			screenManager.openScreen(Tutorial4);
			screen.close();
		},this.x, this.y, this.w-this.buttonW, this.h, 13)); // enter
		this.moveButtons(0, -offset);
	}
	draw(){
		stroke(1);
		super.draw();
		noStroke();
		textSize(12);
		fill(0);
		textAlign(LEFT);
		var message = "Wooden and stone houses " +
				"do not produce any resources, although they do increase the housing space of the vilage and " +
				"are required for reproduction.\n\n" + 
				"You can gain more insight on the resource production and population by pressing g or click on " +
				"the values displayed in the lower right corner. Press Enter to continue.";
		text(message, this.x+2, this.y+6, this.w-this.buttonW, this.h);
	}
}

class Tutorial4 extends CenteredPopUpScreen {
	constructor(){
		super(200, 200, color(255), color(0), true);
		var offset = hudHeight/2+30
		this.y -= offset;
		this.addEntity(new SketchButton(function(screen) {
			screen.close();
		},this.x, this.y, this.w-this.buttonW, this.h, 13)); // enter
		this.moveButtons(0, -offset);
	}
	draw(){
		stroke(1);
		super.draw();
		noStroke();
		textSize(12);
		fill(0);
		textAlign(LEFT);
		var message = "You can use the god powers in the lower left corner by activating them (which will make the icon glow up) " +
				"and then by clicking on the map. You can also press the number assigned to the god power.\n\n" +
				"You can control the speed of time and pause/resume the game in the lower right corner. Press Enter to exit.";
		text(message, this.x+2, this.y+6, this.w-this.buttonW, this.h);
	}
}
