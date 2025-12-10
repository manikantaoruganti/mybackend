const getStudents = (req, res) => {
  let stdData = { name: "aditya", roll: "1234" };
  res.status(200).json({ data: stdData });
};

const addStudents = (req, res) => {
  res.status(201).json({ message: "data added" });
};

export { getStudents, addStudents };
