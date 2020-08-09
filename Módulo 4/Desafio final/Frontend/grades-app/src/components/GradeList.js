import React, { useState, useEffect } from 'react';
import GradeDataService from '../services/GradeService';
import { Link } from 'react-router-dom';

const GradeList = () => {
  const [grade, setGrade] = useState([]);
  const [currentGrade, setCurrentGrade] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    retrieveGrade();
  }, []);

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const retrieveGrade = () => {
    GradeDataService.getAll()
      .then((response) => {
        setGrade(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveGrade();
    setCurrentGrade(null);
    setCurrentIndex(-1);
  };

  const setActiveGrade = (grade, index) => {
    setCurrentGrade(grade);
    setCurrentIndex(index);
  };

  const removeAllGrade = () => {
    GradeDataService.removeAll()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const findByName = () => {
    GradeDataService.findByName(searchName)
      .then((response) => {
        setGrade(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="list row">
      <div className="col-md-8">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Insira um nome"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <div className="input-group-append">
            <button
              className="btn btn-success"
              type="button"
              onClick={findByName}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <h4 style={{ textAlign: 'center' }}>Grade List</h4>

        <ul className="list-group">
          {grade &&
            grade.map((grade, index) => (
              <li
                className={
                  'list-group-item ' + (index === currentIndex ? 'active' : '')
                }
                onClick={() => setActiveGrade(grade, index)}
                key={index}
              >
                {grade.name}
              </li>
            ))}
        </ul>

        <button className="m-3 btn btn-danger" onClick={removeAllGrade}>
          Apagar tudo
        </button>
      </div>
      <div className="col-md-6">
        {currentGrade ? (
          <div>
            <h4>Grade</h4>
            <div>
              <label>
                <strong>Name:</strong>
              </label>{' '}
              {currentGrade.name}
            </div>
            <div>
              <label>
                <strong>Subject:</strong>
              </label>{' '}
              {currentGrade.subject}
            </div>
            <div>
              <label>
                <strong>Type:</strong>
              </label>{' '}
              {currentGrade.type}
            </div>
            <div>
              <label>
                <strong>Value:</strong>
              </label>{' '}
              {currentGrade.value}
            </div>

            <Link
              to={'/grade/' + currentGrade._id}
              className="badge badge-warning"
            >
              Editar
            </Link>
          </div>
        ) : (
          <div>
            <br />
            <p>Clique na grade para visualizar ou editar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeList;
