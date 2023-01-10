/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  CloseButton,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import presentationApi from "../../../api/presentation";
import * as notificationManager from "../../common/notificationManager";
import socketIOClient from "socket.io-client";

export default function PresentationOption({
  sx,
  slide,
  presentationId,
  getAllSlides,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState("");
  const [options, setOptions] = useState([]);
  const [questionValueDebounce] = useDebounce(question, 400);
  const [typeValueDebounce] = useDebounce(type, 400);
  const [answerValueDebounce] = useDebounce(answer, 400);
  const [optionValueDebounce] = useDebounce(options, 400);

  //heading

  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  //paragraph
  const [paragraph, setParagraph] = useState("");

  const [HeadingValueDebounce] = useDebounce(heading, 400);
  const [SubHeadingValueDebounce] = useDebounce(subHeading, 400);
  const [ParagraphValueDebounce] = useDebounce(paragraph, 400);

  const socketRef = useRef();

  const updateSlide = async (data) => {
    try {
      await presentationApi.updateSlide(presentationId, slide._id, data);
      getAllSlides();
      socketRef.current.emit("updateOptions", {
        slideId: slide._id,
      });
    } catch (error) {
      console.log(error);
      notificationManager.showFail("", error.response?.data.message);
    }
  };

  useEffect(() => {
    socketRef.current = socketIOClient.connect(process.env.REACT_APP_BACKEND);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (slide) {
      setHeading(slide?.heading);
      setSubHeading(slide?.subHeading);
      setParagraph(slide?.paragraph);
      setType(slide?.type);
      setQuestion(slide?.question);
      setOptions(slide?.options);
      setAnswer(slide?.answer);
    }
  }, [slide?.type, slide?.question, slide?.options]);

  useEffect(() => {
    if (slide) {
      updateSlide({
        heading: HeadingValueDebounce,
        subHeading: SubHeadingValueDebounce,
        paragraph: ParagraphValueDebounce,
        type: typeValueDebounce,
        question: questionValueDebounce,
        options: optionValueDebounce,
        answer: answerValueDebounce,
      });
    }
  }, [
    HeadingValueDebounce,
    SubHeadingValueDebounce,
    ParagraphValueDebounce,
    questionValueDebounce,
    typeValueDebounce,
    optionValueDebounce,
    answerValueDebounce,
  ]);

  return (
    <Box sx={sx}>
      <>
        <Title sx={{ fontSize: 20 }}>Id: {slide?._id}</Title>
        <Select
          value={type}
          onChange={setType}
          label="Select type"
          placeholder="Select type"
          data={[
            { value: "Multipe_Choice", label: "Multipe Choice" },
            { value: "Heading", label: "Heading" },
            { value: "Paragraph", label: "Paragraph" },
          ]}
        />
        {Boolean(type === "Multipe_Choice") && (
          <Box>
            <TextInput
              label="Question"
              placeholder="Your question"
              required
              value={question || ""}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {Boolean(options?.length) && (
              <Select
                mt={"md"}
                label="Anwser"
                placeholder="Choose anwser"
                value={answer}
                data={[
                  ...options.map((option, index) => ({
                    label: option.value,
                    value: option.value,
                  })),
                ]}
                onChange={(value) => setAnswer(value)}
              />
            )}
            {options.map((option, index) => (
              <OptionItem
                key={index}
                valueOption={option.value}
                updateValueOption={(value) => {
                  const newOptions = [...options];
                  newOptions[index].value = value;
                  setOptions(newOptions);
                }}
                removeOption={() => {
                  const newOptions = [...options];
                  newOptions.splice(index, 1);
                  setOptions(newOptions);
                }}
                number={index + 1}
              />
            ))}
            <Box mt="lg">
              <Button
                sx={{
                  width: "100%",
                }}
                onClick={() => {
                  setOptions([
                    ...options,
                    {
                      value: "",
                      quantity: 0,
                    },
                  ]);
                }}
              >
                Add Option
              </Button>
            </Box>
            <Box mt="lg">
              <Button
                sx={{
                  width: "100%",
                }}
                color="red"
                onClick={() => {
                  setOptions([
                    ...options.map((option) => ({
                      ...option,
                      quantity: 0,
                    })),
                  ]);
                }}
              >
                Reset vote
              </Button>
            </Box>
          </Box>
        )}

        {Boolean(type === "Heading") && (
          <Box>
            <TextInput
              label="Heading"
              placeholder="Heading"
              required
              value={heading || ""}
              onChange={(e) => setHeading(e.target.value)}
            />
            <TextInput
              label="Sub Heading"
              placeholder="Sub Heading"
              required
              value={subHeading || ""}
              onChange={(e) => setSubHeading(e.target.value)}
            />
          </Box>
        )}

        {Boolean(type === "Paragraph") && (
          <Box>
            <TextInput
              label="Heading"
              placeholder="Heading"
              required
              value={heading || ""}
              onChange={(e) => setHeading(e.target.value)}
            />
            <TextInput
              label="Paragraph"
              placeholder="Paragraph"
              required
              value={paragraph || ""}
              onChange={(e) => setParagraph(e.target.value)}
            />
          </Box>
        )}
      </>
    </Box>
  );
}

const OptionItem = ({
  valueOption,
  updateValueOption,
  removeOption,
  number,
}) => {
  return (
    <Box
      mt="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Title
        order={6}
        sx={{
          fontWeight: "500",
        }}
      >
        Options {number}
      </Title>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <TextInput
          placeholder="Option 1"
          sx={{
            width: "100%",
          }}
          value={valueOption}
          onChange={(e) => updateValueOption(e.target.value)}
        />
        <CloseButton onClick={removeOption} />
      </Box>
    </Box>
  );
};
