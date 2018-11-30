const states = [
  { id: 1, name: 'New York', cities: [
    { id: 1, name: 'New York' },
    { id: 2, name: 'New Paultz' }
  ] },
  { id: 2, name: 'Texas', cities: [
    { id: 3, name: 'Austin' },
    { id: 4, name: 'San Antonio' }
  ] },
];

exports.getStates = () => {
  return states;
};
