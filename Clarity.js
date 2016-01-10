/*
Copyright (c) 2013 Suffick at Codepen (http://codepen.io/suffick) and GitHub (https://github.com/suffick)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Clarity = function () {

    this.alert_errors   = false;
    this.log_info       = true;
    this.tile_size      = 12;
    this.limit_viewport = false;
    this.jump_switch    = 0;
    
    this.viewport = {
        x: 450,
        y: 300
    };
    
    this.camera = {
        x: 0,
        y: 0
    };
    
    this.key = {
        left: false,
        right: false,
        up: false
    };

    this.player = {

        loc: {
            x: 0,
            y: 0
        },
        
        vel: {
            x: 0,
            y: 0
        },
        
        can_jump: true
    };

    window.onkeydown = this.keydown.bind(this);
    window.onkeyup   = this.keyup.bind(this);
};

Clarity.prototype.error = function (message) {

    if (this.alert_errors) alert(message);
    if (this.log_info) console.log(message);
};

Clarity.prototype.log = function (message) {

    if (this.log_info) console.log(message);
};

Clarity.prototype.set_viewport = function (x, y) {

    this.viewport.x = x;
    this.viewport.y = y;
};

Clarity.prototype.keydown = function (e) {

    var _this = this;

    switch (e.keyCode) {
    case 37:
        _this.key.left = true;
        break;
    case 38:
        _this.key.up = true;
        break;
    case 39:
        _this.key.right = true;
        break;
    }
};

Clarity.prototype.keyup = function (e) {

    var _this = this;

    switch (e.keyCode) {
    case 37:
        _this.key.left = false;
        break;
    case 38:
        _this.key.up = false;
        break;
    case 39:
        _this.key.right = false;
        break;
    }
};

Clarity.prototype.load_map = function (map) {
    
    if (typeof map      === 'undefined'
     || typeof map.data === 'undefined'
     || typeof map.keys === 'undefined') {

        this.error('Error: Invalid map data!');

        return false;
    }

    this.current_map = map;

    this.current_map.background = map.background || '#333';
    this.current_map.gravity = map.gravity || {x: 0, y: 0.3};
    this.tile_size = map.tile_size || 16;

    var _this = this;
    
    this.current_map.width = 0;
    this.current_map.height = 0;
    map.data.forEach(function (row, y) {
        
        _this.current_map.height = Math.max(_this.current_map.height, y);

        row.forEach(function (tile, x) {
            
            _this.current_map.width = Math.max(_this.current_map.width, x);
            switch (tile) {
                case 0:
                    _this.current_map.data[y][x] = map.keys[0];
                    break;
                case -1:
                    _this.current_map.data[y][x] = map.keys[2];
                    break;
                case -2:
                	_this.current_map.data[y][x] = map.keys[3];
                	break;
                default:
                    _this.current_map.data[y][x] = map.keys[1];
            }
            _this.current_map.data[y][x].id = tile;
            //if (y == 17)
            //    console.log(_this.current_map.data[y][x])
        });
    });
    //console.log(this.current_map.data[17]);
    
    this.current_map.width_p = this.current_map.width * this.tile_size;
    this.current_map.height_p = this.current_map.height * this.tile_size;

    this.player.loc.x = map.player.x * this.tile_size || 0;
    this.player.loc.y = map.player.y * this.tile_size || 0;
    this.player.colour = '#000000';
    
    this.camera = {
        x: 0,
        y: 0
    };
    
    this.player.vel = {
        x: 0,
        y: 0
    };
    this.log('Successfully loaded map data.');

    return true;
};

Clarity.prototype.load_words = function(data) {
    this.words = data
    return true;
};

Clarity.prototype.get_tile = function (x, y) {

    return (this.current_map.data[y] && this.current_map.data[y][x]) ? this.current_map.data[y][x] : 0;
};

Clarity.prototype.draw_tile = function (x, y, tile, context) {

    if (!tile || !tile.colour) return;

    context.fillStyle = tile.colour;
    context.fillRect(
        x,
        y,
        this.tile_size,
        this.tile_size
    );
};

Clarity.prototype.draw_map = function (context, fore) {
    /*
    for (var y = 0; y < this.current_map.data.length; y++) {

        for (var x = 0; x < this.current_map.data[y].length; x++) {
        	
            var t_x = (x * this.tile_size) - this.camera.x;
            var t_y = (y * this.tile_size) - this.camera.y;
            
            if(t_x < -this.tile_size
            || t_y < -this.tile_size
            || t_x > this.viewport.x
            || t_y > this.viewport.y) continue;
            
            this.draw_tile(
                t_x,
                t_y,
                this.current_map.data[y][x],
                context
            );
        }
    }
   */ 
    
    var _this = this;
    var lines = this.words.filter(function (line) {
        return (line.loc.x < _this.camera.x + _this.viewport.x && line.loc.x2 >= _this.camera.x - _this.viewport.x) && (line.loc.y < _this.camera.y + _this.viewport.y && line.loc.y2 >= _this.camera.y - _this.viewport.y);	
    })
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    lines.forEach(function (line) {
    	if (typeof(line.image) !== 'undefined') {
    		
    		ctx.save();
    		img=new Image();
    		img.src = line.image;
    		
    		var x = line.loc.x2 - line.loc.x;
        	var y = line.loc.y2 - line.loc.y;

			var trans_x = line.loc.x - _this.camera.x + (x - x * Math.cos(line.angle)) / 2.0;
        	var trans_y = line.loc.y2 - _this.camera.y + (x * Math.sin(line.angle) + y * Math.sin(Math.PI/2.0 - line.angle) - y) / 2.0;
        	ctx.translate(trans_x, trans_y);
    		
    		ctx.drawImage(img, 0, 0, 200, 300);
    		ctx.restore();
    		
    	} else {
        ctx.font = line.font;
	    ctx.fillStyle = line.color;
        var x = line.loc.x2 - line.loc.x;
        var y = line.loc.y2 - line.loc.y;
        ctx.save()
        var trans_x = line.loc.x - _this.camera.x + (x - x * Math.cos(line.angle)) / 2.0;
        var trans_y = line.loc.y2 - _this.camera.y + (x * Math.sin(line.angle) + y * Math.sin(Math.PI/2.0 - line.angle) - y) / 2.0;
        ctx.translate(trans_x, trans_y);
        ctx.rotate(-1 * line.angle);
	    ctx.fillText(line.text, 0, 0);
        ctx.restore();
       }
    })
    if (!fore) this.draw_map(context, true);
};

Clarity.prototype.move_player = function () {

    var tX = this.player.loc.x + this.player.vel.x;
    var tY = this.player.loc.y + this.player.vel.y;

    var offset = Math.round((this.tile_size / 2) - 1);

    var tile = this.get_tile(
        Math.round(this.player.loc.x / this.tile_size),
        Math.round(this.player.loc.y / this.tile_size)
    );
     
    if(tile.gravity) {
        
        this.player.vel.x += tile.gravity.x;
        this.player.vel.y += tile.gravity.y;
        
    } else {
        
        this.player.vel.x += this.current_map.gravity.x;
        this.player.vel.y += this.current_map.gravity.y;
    }
    
    if (tile.friction) {

        this.player.vel.x *= tile.friction.x;
        this.player.vel.y *= tile.friction.y;
    }

    var t_y_up   = Math.floor(tY / this.tile_size);
    var t_y_down = Math.ceil(tY / this.tile_size);
    var y_near1  = Math.round((this.player.loc.y - offset) / this.tile_size);
    var y_near2  = Math.round((this.player.loc.y + offset) / this.tile_size);

    var t_x_left  = Math.floor(tX / this.tile_size);
    var t_x_right = Math.ceil(tX / this.tile_size);
    var x_near1   = Math.round((this.player.loc.x - offset) / this.tile_size);
    var x_near2   = Math.round((this.player.loc.x + offset) / this.tile_size);

    var top1    = this.get_tile(x_near1, t_y_up);
    var top2    = this.get_tile(x_near2, t_y_up);
    var bottom1 = this.get_tile(x_near1, t_y_down);
    var bottom2 = this.get_tile(x_near2, t_y_down);
    var left1   = this.get_tile(t_x_left, y_near1);
    var left2   = this.get_tile(t_x_left, y_near2);
    var right1  = this.get_tile(t_x_right, y_near1);
    var right2  = this.get_tile(t_x_right, y_near2);


    if (/*tile.jump && */this.jump_switch > 15) {

        this.player.can_jump = true;
        
        this.jump_switch = 0;
        
    } else this.jump_switch++;
    
    this.player.vel.x = Math.min(Math.max(this.player.vel.x, -this.current_map.vel_limit.x), this.current_map.vel_limit.x);
    this.player.vel.y = Math.min(Math.max(this.player.vel.y, -this.current_map.vel_limit.y), this.current_map.vel_limit.y);
    
    this.player.loc.x += this.player.vel.x;
    this.player.loc.y += this.player.vel.y;
    
    this.player.vel.x *= .9;
    
    if (left1.go_thru || left2.go_thru || right1.go_thru || right2.go_thru) {
    	window.location.replace("section2.html");
    }
    
    if ((left1.solid || left2.solid || right1.solid || right2.solid) && !((right1.solid && left1.solid) || (right2.solid && left2.solid))) {

        /* fix overlap */

        while (this.get_tile(Math.floor(this.player.loc.x / this.tile_size), y_near1).solid
            || this.get_tile(Math.floor(this.player.loc.x / this.tile_size), y_near2).solid)
            this.player.loc.x += 0.1;

        while (this.get_tile(Math.ceil(this.player.loc.x / this.tile_size), y_near1).solid
            || this.get_tile(Math.ceil(this.player.loc.x / this.tile_size), y_near2).solid)
            this.player.loc.x -= 0.1;

        /* tile bounce */

        var bounce = 0;

        if (left1.solid && left1.bounce > bounce) bounce = left1.bounce;
        if (left2.solid && left2.bounce > bounce) bounce = left2.bounce;
        if (right1.solid && right1.bounce > bounce) bounce = right1.bounce;
        if (right2.solid && right2.bounce > bounce) bounce = right2.bounce;

        this.player.vel.x *= -bounce || 0;
        
    }
    
    if ((bottom1.solid || bottom2.solid) && this.player.vel.y > 0) {

    /* fix overlap */
        while (this.get_tile(x_near1, Math.floor(this.player.loc.y / this.tile_size)).solid
            || this.get_tile(x_near2, Math.floor(this.player.loc.y / this.tile_size)).solid)
            this.player.loc.y += 0.1;

        while (this.get_tile(x_near1, Math.ceil(this.player.loc.y / this.tile_size)).solid
            || this.get_tile(x_near2, Math.ceil(this.player.loc.y / this.tile_size)).solid)
            this.player.loc.y -= 0.1;

        /* tile bounce */
    
    
        var bounce = 0;
        
        if (top1.solid && top1.bounce > bounce) bounce = top1.bounce;
        if (top2.solid && top2.bounce > bounce) bounce = top2.bounce;
        if (bottom1.solid && bottom1.bounce > bounce) bounce = bottom1.bounce;
        if (bottom2.solid && bottom2.bounce > bounce) bounce = bottom2.bounce;
        
        this.player.vel.y *= -bounce || 0;

        if ((bottom1.solid || bottom2.solid) && !tile.jump) {
            
            this.player.on_floor = true;
            this.player.can_jump = true;
        }
    
    }
    
    // adjust camera

    var c_x = Math.round(this.player.loc.x - this.viewport.x/2);
    var c_y = Math.round(this.player.loc.y - this.viewport.y/2);
    var x_dif = Math.abs(c_x - this.camera.x);
    var y_dif = Math.abs(c_y - this.camera.y);
    
    if(x_dif > 5) {
        
        var mag = Math.round(Math.max(1, x_dif * 0.1));
    
        if(c_x != this.camera.x) {
            
            this.camera.x += c_x > this.camera.x ? mag : -mag;
            
            if(this.limit_viewport) {
                
                this.camera.x = 
                    Math.min(
                        this.current_map.width_p - this.viewport.x + this.tile_size,
                        this.camera.x
                    );
                
                this.camera.x = 
                    Math.max(
                        0,
                        this.camera.x
                    );
            }
        }
    }
    
    if(y_dif > 5) {
        
        var mag = Math.round(Math.max(1, y_dif * 0.1));
        
        if(c_y != this.camera.y) {
            
            this.camera.y += c_y > this.camera.y ? mag : -mag;
        
            if(this.limit_viewport) {
                
                this.camera.y = 
                    Math.min(
                        this.current_map.height_p - this.viewport.y + this.tile_size,
                        this.camera.y
                    );
                
                this.camera.y = 
                    Math.max(
                        0,
                        this.camera.y
                    );
            }
        }
    }
    
    if(this.last_tile != tile.type && tile.script) {
    
        eval(this.current_map.scripts[tile.script]);
    }
    
    this.last_tile = tile.type;
    
    //if (bottom.type != 0)
        //console.log(bottom1.type + "|" + bottom1.id);
    
};

Clarity.prototype.update_player = function () {

    if (this.key.left) {

        if (this.player.vel.x > -this.current_map.vel_limit.x)
            this.player.vel.x -= this.current_map.movement_speed.left;
    }

    if (this.key.up) {

        if (this.player.can_jump && this.player.vel.y > -this.current_map.vel_limit.y) {
            this.player.vel.y = Math.min(0, this.player.vel.y)
            this.player.vel.y -= this.current_map.movement_speed.jump;
            this.player.can_jump = false;
        }
    }

    if (this.key.right) {

        if (this.player.vel.x < this.current_map.vel_limit.x)
            this.player.vel.x += this.current_map.movement_speed.left;
    }

    this.move_player();
};

Clarity.prototype.draw_player = function (context) {
	
	drawing = new Image();

	if (this.key.up) {
		drawing.src = "alice_up.png";
	} 
	
	else if (this.player.vel.y > this.current_map.gravity.y + 5) {
		drawing.src = "alice_down.png";
	} else {
		drawing.src = "alice.png";
	}
	
		context.drawImage(drawing,this.player.loc.x + this.tile_size / 2 - this.camera.x,
			this.player.loc.y + this.tile_size / 2 - this.camera.y - 90,
			70, 95);
	


};

Clarity.prototype.update = function () {

    this.update_player();
};

Clarity.prototype.draw = function (context) {

    this.draw_map(context, false);
    this.draw_player(context);
};
