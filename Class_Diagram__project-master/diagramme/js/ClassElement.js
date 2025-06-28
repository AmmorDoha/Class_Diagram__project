export class ClassElement {
  constructor(name) {
    this.name = name;
    this.attributes = [];
    this.methods = [];
  }

  addAttribute(attribute) {
    this.attributes.push(attribute);
  }


  addMethod(method) {
    this.methods.push(method);
  }

  deleteAttribute(attribute) {
    const index = this.attributes.indexOf(attribute);
    if (index !== -1) {
      this.attributes.splice(index, 1);
    }
  }

  removeMethod(methodName) {
    this.methods = this.methods.filter(method => method.name !== methodName);
  }

  // Méthode pour obtenir une représentation sous forme de chaîne de caractères
  toString() {
    let result = `Class ${this.name}\n`;
  
    if (this.attributes.length > 0) {
      result += "Attributes:\n";
      this.attributes.forEach(attr => {
        result += `  ${attr.name}: ${attr.type}\n`;
      });
    }
  
    if (this.methods.length > 0) {
      result += "Methods:\n";
      this.methods.forEach(method => {
        const params = method.parameters.map(param => `${param.name}: ${param.type}`).join(", ");
        result += `  ${method.name}(${params})\n`;
      });
    }
  
    return result;
  }
  
}

// Classes pour les attributs et les méthodes
class Attribute {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

class Method {
  constructor(name, parameters = []) {
    this.name = name;
    this.parameters = parameters;
  }
}


