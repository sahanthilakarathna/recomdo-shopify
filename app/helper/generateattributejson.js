export const GenerateAttributesJson = async (attributes) => {
  var allAttributes = [];
  for (const attribute of attributes) {
    var option = attribute.options;
    var values = [];
    for (const value of option[0].values) {
      values.push({
        value: value.toLowerCase(),
        label: value,
      });
    }
    allAttributes.push({
      code: option[0].name.toLowerCase().replace(" ", "_"),
      name: option[0].name,
      type: "select",
      is_filterable: "1",
      is_searchable: "1",
      option: values,
    });
  }
  const defaultAttributes = ["Name", "Description", "SKU", "Price", "Created"];
  for (const defaultAttribute of defaultAttributes) {
    allAttributes.push({
      code: defaultAttribute.toLowerCase(),
      name: defaultAttribute,
      type:
        defaultAttribute == "Price"
          ? "price"
          : defaultAttribute === "Created"
            ? "date"
            : "text",
      is_filterable: "1",
      is_searchable: "1",
      option: [],
    });
  }

  return JSON.stringify(allAttributes, null, 2);
};
