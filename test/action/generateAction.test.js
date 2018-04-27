import {generateAction} from '../../src/action/generateAction';
import {fromJS} from 'immutable';

const rootValue = fromJS({
  user: {
    name: 'name',
    info: {
      address: {
        lat: 23,
        lng: 120
      },
      phone: [
        {type: 'H', value: 'xxx'},
        {type: 'C', value: 'yyy'}
      ]
    }
  },
  posts: [{
    id: 'id1',
    title: 'title1',
    comment: [{
      text: 'xxx',
      author: 'xxx'
    }, {
      text: 'yyy',
      author: 'yyy'
    }],
    users: [{}]
  }, {
    id: 'id2',
    title: 'title1',
    comment: [{
      text: 'xxx',
      author: 'xxx'
    }, {
      text: 'yyy',
      author: 'yyy'
    }],
    users: [{name: 'name1'}, {name: 'name2'}]
  }],
});

describe('update action', () => {
  it('update an array item', () => {
    const action = generateAction({
      id: 'posts/0/comment/0/text',
      updateType: 'update',
      value: 'zzz',
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_ARRAY',
      payload: {
        key: 'posts',
        id: 'id1',
        value: rootValue.getIn(['posts', 0])
          .setIn(['comment', 0, 'text'], 'zzz')
          .toJS()
      }
    });
  });

  it('update object with path', () => {
    const action = generateAction({
      id: 'user/info/phone/0/type',
      updateType: 'update',
      value: 'C',
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_OBJECT',
      payload: {
        key: 'user',
        id: "",
        value: rootValue.getIn(['user'])
          .setIn(['info', 'phone', 0, 'type'], 'C')
          .toJS()
      }
    });
  })
});

describe('create action', () => {
  it('create root array item', () => {
    const action = generateAction({
      id: 'posts',
      updateType: 'create',
      value: fromJS({
        title: '',
        comments: [],
        users: []
      }),
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'CREATE_ARRAY',
      payload: {
        key: 'posts',
        id: undefined,
        value: {
          title: '',
          comments: [],
          users: []
        }
      }
    });
  });

  it('create array item in array', () => {
    const action = generateAction({
      id: 'posts/0/users',
      updateType: 'create',
      value: {
        name: ''
      },
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_ARRAY',
      payload: {
        key: 'posts',
        id: 'id1',
        value: rootValue.getIn(['posts', 0])
          .updateIn(['users'], list => list.push(fromJS({name: ''})))
          .toJS()
      }
    });
  });

  it('create array item in object', () => {
    const action = generateAction({
      id: 'user/info/phone',
      updateType: 'create',
      value: {
        type: '',
        value: ''
      },
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_OBJECT',
      payload: {
        key: 'user',
        id: '',
        value: rootValue.get('user')
          .updateIn(['info', 'phone'], list => list.push(fromJS({type: '', value: ''})))
          .toJS()
      }
    });
  });

  it('create a relation array item', () => {
    const action = generateAction({
      id: 'posts/0/users',
      updateType: 'create',
      value: fromJS({
        name: ''
      }),
      relation: {
        to: 'users',
        type: 'toMany'
      },
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'CREATE_AND_CONNECT',
      payload: {
        key: 'posts',
        id: 'id1',
        path: 'users',
        value: {
          name: ''
        }
      }
    });
  });
});

describe('delete action', () => {
  it('delete root array item', () => {
    const action = generateAction({
      id: 'posts/0',
      updateType: 'delete',
      rootValue,
    });
    expect(action).toEqual({
      type: 'DELETE_ARRAY',
      payload: {
        key: 'posts',
        id: 'id1'
      }
    });
  });

  it('delete array item in array', () => {
    const action = generateAction({
      id: 'posts/1/users/0',
      updateType: 'delete',
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_ARRAY',
      payload: {
        key: 'posts',
        id: 'id2',
        value: rootValue.getIn(['posts', 1])
          .updateIn(['users'], list => list.delete(0))
          .toJS()
      }
    });
  });

  it('delete array item in object', () => {
    const action = generateAction({
      id: 'user/info/phone/1',
      updateType: 'delete',
      rootValue,
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_OBJECT',
      payload: {
        key: 'user',
        id: '',
        value: rootValue.get('user')
          .updateIn(['info', 'phone'], list => list.delete(1))
          .toJS()
      }
    });
  });

  it('delete a relation array item', () => {
    const action = generateAction({
      id: 'posts/0/users',
      updateType: 'delete',
      value: {
        id: 'user2'
      },
      relation: {
        to: 'users',
        type: 'toMany'
      },
      rootValue,
    });
    expect(action).toEqual({
      type: 'DISCONNECT_AND_DELETE',
      payload: {
        key: 'posts',
        id: 'id1',
        path: 'users',
        value: {
          id: 'user2'
        }
      }
    });
  });
});

describe('swap action', () => {
  it('swap root array item', () => {
    const action = generateAction({
      id: {
        firstId: 'posts/0',
        secondId: 'posts/1'
      },
      updateType: 'swap',
      rootValue
    });
    expect(action).toEqual({
      type: 'NOOP',
      payload: {}
    });
  });

  it('swap array item in array', () => {
    const action = generateAction({
      id: {
        firstId: 'posts/1/users/0',
        secondId: 'posts/1/users/1',
      },
      updateType: 'swap',
      rootValue
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_ARRAY',
      payload: {
        key: 'posts',
        id: 'id2',
        value: rootValue.getIn(['posts', 1])
          .set('users', fromJS([{
            name: 'name2'
          }, {
            name: 'name1'
          }]))
          .toJS()
      }
    });
  });

  it('swap array item in object', () => {
    const action = generateAction({
      id: {
        firstId: 'user/info/phone/0',
        secondId: 'user/info/phone/1',
      },
      updateType: 'swap',
      rootValue
    });
    action.payload.value = action.payload.value.toJS();
    expect(action).toEqual({
      type: 'UPDATE_OBJECT',
      payload: {
        key: 'user',
        id: '',
        value: rootValue.getIn(['user'])
          .setIn(['info', 'phone'],fromJS([{
            type: 'C',
            value: 'yyy'
          }, {
            type: 'H',
            value: 'xxx'
          }]))
          .toJS()
      }
    });
  });
});

describe('connect action', () => {
  it('connect relation array itme', () => {
    const action = generateAction({
      id: 'posts/0/users',
      updateType: 'connect',
      value: {
        id: 'id1'
      },
      rootValue,
      relation: {}
    });
    expect(action).toEqual({
      type: 'CONNECT',
      payload: {
        key: 'posts',
        id: 'id1',
        path: 'users',
        value: {
          id: 'id1'
        }
      }
    });
  });
});

describe('disconnect action', () => {
  it('disconnect relation array item', () => {
    const action = generateAction({
      id: 'posts/0/users',
      updateType: 'disconnect',
      value: {
        id: 'id1'
      },
      rootValue,
      relation: {}
    });
    expect(action).toEqual({
      type: 'DISCONNECT',
      payload: {
        key: 'posts',
        id: 'id1',
        path: 'users',
        value: {
          id: 'id1'
        }
      }
    });
  });
});
