export class Relation {
  constructor(fromClass, toClass, type, cardinality = new Cardinality('1', '1')) {
    this.fromClass = fromClass; // Instance de ClassElement représentant la classe de départ
    this.toClass = toClass;     // Instance de ClassElement représentant la classe d'arrivée
    this.type = type;           // Type de la relation (par exemple, 'association', 'héritage')
    this.cardinality = cardinality; // Instance de Cardinality
  }

  setFromClass(fromClass) {
    this.fromClass = fromClass;
  }

  setToClass(toClass) {
    this.toClass = toClass;
  }

  setType(type) {
    this.type = type;
  }

  setCardinality(cardinality) {
    if (cardinality instanceof Cardinality) {
      this.cardinality = cardinality;
    } else {
      console.error("Invalid cardinality object");
    }
  }

  toString() {
    return `${this.fromClass.name} --${this.type} (${this.cardinality.toString()})--> ${this.toClass.name}`;
  }
}
