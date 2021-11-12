<template>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
        v-model="input"
        @keyup.enter="addTodo"
      />
    </header>
    <!-- This section should be hidden by default and shown when there are todos -->
    <section class="main" v-show="count">
      <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone" />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <!-- These are here just to show the structure of the list items -->
        <!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
        <!-- <li class="completed">
          <div class="view">
            <input class="toggle" type="checkbox" checked />
            <label>Taste JavaScript</label>
            <button class="destroy"></button>
          </div>
          <input class="edit" value="Create a TodoMVC template" />
        </li>
        <li>
          <div class="view">
            <input class="toggle" type="checkbox" />
            <label>Buy a unicorn</label>
            <button class="destroy"></button>
          </div>
          <input class="edit" value="Rule the web" />
        </li> -->
        <li
          v-for="todo of filteredTodos"
          :key="todo"
          :class="{ editing: editingTodo === todo, completed: todo.completed }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @click="edit(todo)">{{ todo.text }}</label>
            <button class="destroy" @click="remove(todo)"></button>
          </div>
          <input
            class="edit"
            v-model="todo.text"
            v-editing-focus="editingTodo === todo"
            @keyup.enter="doneEdit(todo)"
            @blur="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
    <!-- This footer should be hidden by default and shown when there are todos -->
    <footer class="footer" v-show="count">
      <!-- This should be `0 items left` by default -->
      <span class="todo-count"><strong>{{ remainingCount }}</strong> {{ remainingCount > 1 ? 'items' : 'item' }} left</span>
      <!-- Remove this if you don't implement routing -->
      <ul class="filters">
        <li>
          <a :class="{ selected: type === 'all' }" href="#/">All</a>
        </li>
        <li>
          <a :class="{ selected: type === 'active' }" href="#/active">Active</a>
        </li>
        <li>
          <a :class="{ selected: type === 'completed' }" href="#/completed">Completed</a>
        </li>
      </ul>
      <!-- Hidden if no completed items are left ↓ -->
      <button class="clear-completed" v-show="count > remainingCount" @click="removeCompleted">Clear completed</button>
    </footer>
  </section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
    <!-- Remove the below line ↓ -->
    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
    <!-- Change this out with your name and url ↓ -->
    <p>Created by <a href="http://todomvc.com">you</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
  </footer>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from "vue";
import "./assets/index.css";

// 1.添加待办事项
const useAdd = (todos) => {
  const input = ref("");
  const addTodo = () => {
    const text = input.value && input.value.trim();
    if (text.length === 0) return;
    todos.value.unshift({
      text,
      completed: false,
    });
    input.value = "";
  };
  return { input, addTodo };
};
// 2.删除代办事项
const useRemove = (todos) => {
  const remove = (todo) => {
    const index = todos.value.indexOf(todo);
    todos.value.splice(index, 1);
  };
  const removeCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  return { remove, removeCompleted };
};
// 3.编辑代办事项
const useEdit = (remove) => {
  let oldText = '';
  const editingTodo = ref(null);
  const edit = (todo) => {
    oldText = todo.text;
    editingTodo.value = todo;
  };
  const doneEdit = (todo) => {
    if (!editingTodo.value) return;
    todo.text = todo.text.trim();
    todo.text || remove(todo);
    editingTodo.value = null;
  };
  const cancelEdit = (todo) => {
    editingTodo.value = null;
    todo.text = oldText;
  };
  return { editingTodo, edit, doneEdit, cancelEdit };
};
// 4.切换待办事项
const useFilter = todos => {
  const allDone = computed({
    get () {
      return todos.value.every(todo => todo.completed)
    },
    set (value) {
      todos.value.forEach(todo => {
        todo.completed = value
      });
    }
  })

  const filter = {
    all: list => list,
    active: list => list.filter(item => !item.completed),
    completed: list => list.filter(item => item.completed),
  }
  const type = ref('all')
  const filteredTodos = computed(() => filter[type.value](todos.value))
  const remainingCount = computed(() => filter.active(todos.value).length)
  const count = computed(() => todos.value.length)
  const onHashChange = () => {
    const hash = location.hash.replace('#/', '')
    if (filter[hash]) {
      type.value = hash
    } else {
      type.value = 'all'
      location.hash = ''
    }
  }
  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
  })
  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })

  return { allDone, filteredTodos, remainingCount, count, type }
}

export default {
  name: "App",
  setup() {
    const todos = ref([]);
    const { remove, removeCompleted } = useRemove(todos);
    return {
      todos,
      remove,
      removeCompleted,
      ...useAdd(todos),
      ...useEdit(remove),
      ...useFilter(todos),
    };
  },
  directives: {
    editingFocus: (el, binding) => {
      binding.value && el.focus()
    }
  }
};
</script>
