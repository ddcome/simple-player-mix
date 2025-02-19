### 一、面向对象编程（OOP）在 JavaScript 中的详解

**面向对象编程（Object-Oriented Programming，OOP）** 是一种以 **对象** 为核心的编程范式，通过封装数据和行为、定义类与对象之间的关系，实现代码的模块化和复用。JavaScript 是一种基于 **原型（Prototype）** 的面向对象语言，但其 ES6 版本引入了 `class` 语法糖，使 OOP 的实现更接近传统类式语言。

---

#### 1. OOP 的四大核心特性
在 JavaScript 中的实现如下：

##### (1) 封装（Encapsulation）
将数据（属性）和操作数据的方法（行为）绑定在一个对象中，隐藏内部细节，仅暴露必要的接口。
```javascript
class Person {
  constructor(name, age) {
    this._name = name; // 约定俗成的“私有”属性（实际并非真正私有）
    this._age = age;
  }

  // 公共方法暴露访问接口
  get name() {
    return this._name;
  }

  set age(newAge) {
    if (newAge > 0) this._age = newAge;
  }

  greet() {
    console.log(`Hello, I'm ${this._name}`);
  }
}

const alice = new Person("Alice", 30);
alice.greet(); // 输出: Hello, I'm Alice
```

##### (2) 继承（Inheritance）
子类可以继承父类的属性和方法，并扩展自己的逻辑。JavaScript 通过 `extends` 实现继承。
```javascript
class Student extends Person {
  constructor(name, age, major) {
    super(name, age); // 调用父类构造函数
    this.major = major;
  }

  study() {
    console.log(`${this.name} is studying ${this.major}`);
  }
}

const bob = new Student("Bob", 20, "Computer Science");
bob.greet(); // 继承自 Person 的方法
bob.study(); // 输出: Bob is studying Computer Science
```

##### (3) 多态（Polymorphism）
同一方法在不同对象中表现出不同的行为。通过方法重写（Override）实现。
```javascript
class Teacher extends Person {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  // 重写父类的 greet 方法
  greet() {
    console.log(`Hello, I'm ${this.name}, teaching ${this.subject}`);
  }
}

const carol = new Teacher("Carol", 40, "Math");
carol.greet(); // 输出: Hello, I'm Carol, teaching Math
```

##### (4) 抽象（Abstraction）
通过定义抽象类或接口（JavaScript 无原生接口）约定规范，隐藏复杂实现。
```javascript
// 通过继承和抛出错误模拟抽象类
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("Shape is abstract and cannot be instantiated");
    }
  }

  // 抽象方法（需子类实现）
  calculateArea() {
    throw new Error("Method 'calculateArea()' must be implemented");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  calculateArea() {
    return Math.PI * this.radius ** 2;
  }
}

const circle = new Circle(5);
console.log(circle.calculateArea()); // 输出: ~78.54
```

---

#### 2. JavaScript 的原型链机制
JavaScript 的 OOP 基于 **原型继承**，每个对象都有一个原型（`__proto__`），方法调用时会沿原型链查找。
```javascript
// 原型链示例
const parent = { value: 10 };
const child = Object.create(parent);
console.log(child.value); // 输出: 10（通过原型链访问）
```

---

### 二、其他编程范式

除了面向对象编程，常见的编程范式还包括：

#### 1. 过程式编程（Procedural Programming）
- **核心思想**：以 **过程（函数）** 为中心，按步骤分解任务。
- **特点**：线性流程、无状态函数。
- **JavaScript 示例**：
  ```javascript
  function calculateTotal(prices) {
    let total = 0;
    for (const price of prices) {
      total += price;
    }
    return total;
  }
  ```

#### 2. 函数式编程（Functional Programming, FP）
- **核心思想**：将计算视为数学函数求值，强调 **不可变数据** 和 **纯函数**。
- **特点**：高阶函数、无副作用、函数组合。
- **JavaScript 示例**：
  ```javascript
  const numbers = [1, 2, 3];
  const doubled = numbers.map(n => n * 2); // [2, 4, 6]
  ```

#### 3. 响应式编程（Reactive Programming）
- **核心思想**：通过 **数据流（Stream）** 和 **观察者模式** 处理异步事件。
- **特点**：事件驱动、数据流传播。
- **JavaScript 示例**（使用 RxJS）：
  ```javascript
  import { fromEvent } from 'rxjs';
  const button = document.querySelector('button');
  fromEvent(button, 'click').subscribe(() => console.log('Clicked!'));
  ```

#### 4. 逻辑式编程（Logic Programming）
- **核心思想**：通过定义 **规则和事实** 推导结果（如 Prolog）。
- **特点**：声明式语法、自动推理。
- **伪代码示例**：
  ```prolog
  parent(john, bob).
  parent(bob, carol).
  ancestor(X, Y) :- parent(X, Y).
  ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).
  ```

#### 5. 泛型编程（Generic Programming）
- **核心思想**：编写与数据类型无关的通用算法。
- **特点**：模板（C++）、泛型（TypeScript）。
- **TypeScript 示例**：
  ```typescript
  function identity<T>(arg: T): T {
    return arg;
  }
  ```

#### 6. 事件驱动编程（Event-Driven Programming）
- **核心思想**：通过 **事件监听器** 响应外部事件（如 GUI 交互）。
- **JavaScript 示例**：
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!');
  });
  ```

---

### 三、不同范式的对比
| 范式               | 核心单元     | 典型应用场景           |
|--------------------|--------------|------------------------|
| 面向对象（OOP）    | 对象         | GUI 应用、游戏开发     |
| 函数式（FP）       | 函数         | 数据处理、并发编程     |
| 过程式             | 过程/函数    | 简单脚本、数学计算     |
| 响应式             | 数据流       | 实时应用、UI 交互      |
| 事件驱动           | 事件监听器   | 前端交互、异步 I/O     |

JavaScript 支持 **多范式编程**，开发者可根据需求混合使用 OOP、FP 和事件驱动等范式。
