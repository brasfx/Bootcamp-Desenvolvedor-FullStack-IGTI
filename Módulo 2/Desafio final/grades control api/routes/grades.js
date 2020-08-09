import express from 'express';
import { promises } from 'fs';

const router = express.Router();
const readFile = promises.readFile;
const writeFile = promises.writeFile;

router.get('/', async (_, res) => {
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    delete json.nextId;
    res.send(json);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  let grade = req.body;
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    grade = {
      id: json.nextId++,
      student: req.body.student,
      subject: req.body.subject,
      type: req.body.type,
      value: parseInt(req.body.value),
      timestamp: new Date(),
      ...grade,
    };
    json.grades.push(grade);
    await writeFile(fileName, JSON.stringify(json));
    res.send(grade);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Altera os dados de uma grade de acordo o id
router.put('/', async (req, res) => {
  const newGrade = req.body;
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const oldIndex = json.grades.findIndex((grade) => grade.id === newGrade.id);
    json.grades[oldIndex].student = newGrade.student;
    json.grades[oldIndex].subject = newGrade.subject;
    json.grades[oldIndex].type = newGrade.type;
    json.grades[oldIndex].value = newGrade.value;

    await writeFile(fileName, JSON.stringify(json));
    res.send('Usuario atualizado com sucessso!');
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Deleta uma grade de acordo o id
router.delete('/:id', async (req, res) => {
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10)
    );
    json.grades = grade;
    await writeFile(fileName, JSON.stringify(json));
    res.send('Usuario removido com sucessso!');
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Consluta um usuario de acorodo com id
router.get('/:id', async (req, res) => {
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );
    if (grade) {
      res.send(grade);
    } else {
      res.end('Usuario não encontrado');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Retorna a nota total do aluno de acordo o curso
router.post('/subject', async (req, res) => {
  const params = req.body;
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.filter(
      (grade) =>
        grade.student === params.student && grade.subject === params.subject
    );

    if (grade) {
      const totalValueSubject = grade.reduce((acc, cur) => {
        return acc + cur.value;
      }, 0);
      res.send(JSON.stringify(totalValueSubject));
    } else {
      res.end('Usuario não encontrado');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Retorna a média de acordo o curso e tipo
router.put('/type', async (req, res) => {
  const params = req.body;
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.filter(
      (grade) => grade.subject === params.subject && grade.type === params.type
    );

    if (grade) {
      const totalValueType = grade.reduce((acc, cur) => {
        return acc + cur.value;
      }, 0);

      const resultMedia = totalValueType / grade.length;
      res.send(JSON.stringify(resultMedia));
    } else {
      res.end('Usuario não encontrado');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Retorna as 3 melhores grades em orde dec. de acordo o value
router.put('/bestgrade', async (req, res) => {
  const params = req.body;
  try {
    const data = await readFile(fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.filter(
      (grade) => grade.subject === params.subject && grade.type === params.type
    );
    //console.log(grade);
    if (grade) {
      const gradesSorted = grade.sort((a, b) => {
        return b.value - a.value;
      });
      const resultSorted = gradesSorted.slice(0, 3);
      res.send(resultSorted);
    } else {
      res.end('Usuario não encontrado');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

export default router;
