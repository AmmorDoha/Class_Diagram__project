export class Parameter {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

export class Method {
  constructor(name, returnType) {
    this.name = name;
    this.returnType = returnType;
    this.parameters = [];
  }

  // Ajouter un paramètre à la méthode
  addParameter(parameter) {
    this.parameters.push(parameter);
  }

  // Supprimer un paramètre de la méthode
  removeParameter(parameterName) {
    this.parameters = this.parameters.filter(param => param.name !== parameterName);
  }

  // Modifier le type de retour de la méthode
  setReturnType(newReturnType) {
    this.returnType = newReturnType;
  }

  // Méthode pour obtenir une représentation sous forme de chaîne de caractères
  toString() {
    const params = this.parameters.map(param => `${param.name}: ${param.type}`).join(", ");
    return `${this.name}(${params}): ${this.returnType}`;
  }
}
