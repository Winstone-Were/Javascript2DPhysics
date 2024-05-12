
let Canvas = document.querySelector("canvas");
let Ctx = Canvas.getContext("2d");
let AllObjects = [];
let ObjectIndex;

let RenderLoop = function () {
    requestAnimationFrame(() => {
        RenderLoop();
    });
    draw();
}

const draw = () => {
    Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    for (let i = 0; i < AllObjects.length; i++) {
        Ctx.strokeStyle = 'blue';
        if (i == ObjectIndex) {
            Ctx.strokeStyle = 'red';
        }
        AllObjects[i].draw(Ctx);
    }
}

const EngineCore = () => {
    RenderLoop();
    userInput(Ctx, Canvas.width, Canvas.height);
}

let Vec2 = function (x, y) {
    this.x = x;
    this.y = y;

    this.Length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    this.add = (vec) => {
        return new Vec2(vec.x + this.x, vec.y + this.y);
    }

    this.normalize = () => {
        let len = this.Length();
        if (len > 0) {
            len = 1 / len;
        }
        return new Vec2(this.x * len, this.y * len);
    }

    this.subtract = (vec) => {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    this.scale = (n) => {
        return new Vec2(this.x * n, this.y * n);
    }

    this.dot = (vec) => {
        return (this.x * vec.x + this.y * vec.y);
    }

    this.cross = (vec) => {
        return (this.x * vec.y - this.y * vec.x);
    }

    this.rotate = (center, angle) => {
        let r = [];
        let x = this.x - center.x;
        let y = this.y - center.y;

        r[0] = x * Math.cos(angle) - y * Math.sin(angle);
        r[1] = x * Math.sin(angle) + y * Math.cos(angle);
        r[0] += center.x;
        r[1] += center.y;

        return new Vec2(r[0], r[1]);
    }

    this.distance = (vec) => {
        let x = this.x - vec.x;
        let y = this.y - vec.y;

        return Math.sqrt(x * x + y * y);
    }

};

const SampleVector = new Vec2(10, 10);
console.log(SampleVector.add(new Vec2(10, 10)))


function RigidShape(center) {
    this.center = center;
    this.angle = 0;
    AllObjects.push(this);
}

var Rectangle = function (center, width, height) {
    RigidShape.call(this, center);
    this.type = "Rectangle";
    this.width = width;
    this.height = height;
    this.vertex = [];
    this.faceNormal = [];

    //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
    this.vertex[0] = new Vec2(center.x - width / 2, center.y - height / 2);
    this.vertex[1] = new Vec2(center.x + width / 2, center.y - height / 2);
    this.vertex[2] = new Vec2(center.x + width / 2, center.y + height / 2);
    this.vertex[3] = new Vec2(center.x - width / 2, center.y + height / 2);

    //0--Top;1--Right;2--Bottom;3--Left
    //faceNormal is normal of face toward outside of rectangle
    this.faceNormal[0] = this.vertex[1].subtract(this.vertex[2]);
    this.faceNormal[0] = this.faceNormal[0].normalize();
    this.faceNormal[1] = this.vertex[2].subtract(this.vertex[3]);
    this.faceNormal[1] = this.faceNormal[1].normalize();
    this.faceNormal[2] = this.vertex[3].subtract(this.vertex[0]);
    this.faceNormal[2] = this.faceNormal[2].normalize();
    this.faceNormal[3] = this.vertex[0].subtract(this.vertex[1]);
    this.faceNormal[3] = this.faceNormal[3].normalize();
}

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Rectangle;
Rectangle.prototype = prototype;

Rectangle.prototype.draw = function (context) {
    context.save();
    context.translate(this.vertex[0].x, this.vertex[0].y);
    context.rotate(this.angle);
    context.strokeRect(0, 0, this.width, this.height);
    context.restore();
}

var Circle = function (center, radius) {
    RigidShape.call(this, center);
    this.type = "Circle";
    this.radius = radius;
    this.startPoint = new Vec2(center.x, center.y - radius);
}

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Circle;
Circle.prototype = prototype;

Circle.prototype.draw = function (context) {
    context.beginPath();
    //draw a circle
    context.arc(this.center.x, this.center.y,
        this.radius, 0, Math.PI * 2, true);
    //draw a line from start point toward center
    context.moveTo(this.startPoint.x, this.startPoint.y);
    context.lineTo(this.center.x, this.center.y);
    context.closePath();
    context.stroke();
};

const DrawRectangle = (context, width, height) => {
    context.strokeRect(
        //x position
        Math.random() * width * 0.8,
        //y position
        Math.random() * height * 0.8,
        //Width and Height
        Math.random() * 30 + 10, Math.random() * 30 + 10
    );
}

const DrawCircle = (context, width, height) => {
    context.beginPath();
    context.arc(
        //x position
        Math.random() * width * 0.8,
        //y position
        Math.random() * height * 0.8,
        //radius, start angle, endAngle, counterClockwise
        Math.random() * 30 + 10, 0, Math.PI * 2, true
    );

    context.closePath();
    context.stroke();
}

const userInput = (context, width, height) => {

    // w --> 119
    // a --> 97
    // s --> 115
    // d --> 100

    //f --> 102 Rectangle
    //g --> 103 Circle 


    //< --> 44
    //> --> 46 

    window.addEventListener("keypress", event => {
        console.log(AllObjects);
        console.log(event.keyCode)

        if (event.keyCode >= 48 && event.keyCode <= 57) {
            ObjectIndex = event.keyCode - 48;
        }
        if (event.keyCode == 44) {
            if (ObjectIndex > 0) {
                ObjectIndex--;
            }
        }
        if (event.keyCode == 46) {
            if (ObjectIndex < AllObjects.length - 1) {
                ObjectIndex++;
            }
        }

        if (event.keyCode == 102) {
            let r1 = new Rectangle(
                new Vec2(Math.random() * width * 0.8, Math.random() * height * 0.8),
                Math.random() * 30 + 10,
                Math.random() * 30 + 10
            );
        } else if (event.keyCode == 103) {
            let r1 = new Circle(new Vec2(Math.random() * width * 0.8,
                Math.random() * height * 0.8),
                Math.random() * 10 + 20);
        } else if (event.keyCode == 99) {
            context.clearRect(0, 0, width, height);
        }
    })
}

EngineCore();