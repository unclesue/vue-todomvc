export const todoStorage = {
  fetch: function (STORAGE_KEY) {
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    todos.forEach(function (todo, index) {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save: function (STORAGE_KEY, todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
};
