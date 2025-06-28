export class Attribute {
  constructor(name, type) {
    this.name = name; // Le nom de l'attribut
    this.type = type; // Le type de l'attribut (par exemple, 'int', 'String', etc.)
  }

  // Méthode pour modifier le nom de l'attribut
  setName(newName) {
    this.name = newName;
  }

  // Méthode pour modifier le type de l'attribut
  setType(newType) {
    this.type = newType;
  }

  // Méthode pour obtenir une représentation sous forme de chaîne de caractères
  toString() {
    return `${this.name}: ${this.type}`;
  }
}
