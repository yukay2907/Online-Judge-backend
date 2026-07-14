const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const EXECUTION_TIMEOUT_MS = 3000;

const EXECUTION_ERROR_TYPES = {
  TIMEOUT: "TIMEOUT",
  EXECUTION_FAILED: "EXECUTION_FAILED",
};

const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || "python";

const createWorkingDirectory = async (submissionId) => {
  const workspacePath = path.join(
    __dirname,
    "..",
    "temp",
    submissionId.toString(),
  );

  await fs.promises.mkdir(workspacePath, {
    recursive: true,
  });

  return workspacePath;
};

const writeSourceFile = async (workspacePath, code, language) => {
  const extensions = {
    python: ".py",
  };

  if (!extensions[language]) {
    throw new Error("Unsupported Language");
  }

  const extension = extensions[language];

  const filePath = path.join(workspacePath, `solution${extension}`);

  await fs.promises.writeFile(filePath, code);

  return filePath;
};

const runProgram = async (filePath, input) => {
  const extension = path.extname(filePath);

  const runners = {
    ".py": runPython,
  };

  const runner = runners[extension];

  if (!runner) {
    throw new Error("Unsupported Language");
  }

  return await runner(filePath, input);
};

const runPython = (filePath, input) => {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_EXECUTABLE, [filePath]);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => {
      stdout.push(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr.push(chunk);
    });

    const timeoutId = setTimeout(() => {
      child.kill();
    }, EXECUTION_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      return reject(error);
    });

    child.on("close", (code, signal) => {
      clearTimeout(timeoutId);

      const output = stdout.join("");
      const stderrOutput = stderr.join("");

      if (signal) {
        const executionError = new Error("Execution timed out");
        executionError.type = EXECUTION_ERROR_TYPES.TIMEOUT;
        return reject(executionError);
      }

      if (code === 0) {
        return resolve({
          stdout: output,
          stderr: stderrOutput,
        });
      }
      const executionError = new Error("Python execution failed");
      executionError.type = EXECUTION_ERROR_TYPES.EXECUTION_FAILED;

      executionError.stdout = output;
      executionError.stderr = stderrOutput;
      executionError.exitCode = code;

      return reject(executionError);
    });

    child.stdin.write(input ?? "");
    child.stdin.end();
  });
};

const executeCode = async ({ submissionId, code, language, testCases }) => {
  try {
    //create workspace
    const workspacePath = await createWorkingDirectory(submissionId);

    //write source file
    const filePath = await writeSourceFile(workspacePath, code, language);

    //loop
    for (const testCase of testCases) {
      //run program
      const { stdout, stderr } = await runProgram(filePath, testCase.input);

      //normalize
      const actualOutput = stdout.trim();
      const expectedOutput = testCase.output.trim();

      //compare
      if (actualOutput !== expectedOutput) {
        return {
          verdict: "Wrong Answer",
          stdout,
          stderr,
          runtime: 0,
          memory: 0,
        };
      }
    }
    return {
      verdict: "Accepted",
      stdout: "",
      stderr: "",
      runtime: 0,
      memory: 0,
    };
  } catch (error) {
    //compute verdict
    const verdict =
      error.type == EXECUTION_ERROR_TYPES.TIMEOUT
        ? "Time Limit Exceeded"
        : "Runtime Error";

    return {
      verdict,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
      runtime: 0,
      memory: 0,
    };
  }
};

module.exports = {
  createWorkingDirectory,
  writeSourceFile,
  runProgram,
  runPython,
  executeCode,
};
