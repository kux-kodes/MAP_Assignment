import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const HelpScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', type: 'bot', text: 'Hello! Welcome to the Namibia Hockey Union help center. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  
  // Predefined questions and answers
  const qaPairs = [
    {
      question: 'How do I register a team?',
      answer: 'To register a team, go to the Teams tab and tap on the + button. Fill in the required information and submit the form.'
    },
    {
      question: 'How do I register a player?',
      answer: 'You can register a player by going to the Players tab and tapping the + button. Complete the registration form with all required player details.'
    },
    {
      question: 'When are the upcoming events?',
      answer: 'All upcoming events can be found in the Events tab. The most recent events are also displayed on the Home screen.'
    },
    {
      question: 'What categories are available for teams?',
      answer: 'We have several categories including Senior Men, Senior Women, Junior Men, Junior Women, Boys/Girls U18, U16, and U14.'
    },
    {
      question: 'How can I contact the hockey union?',
      answer: 'You can reach the Namibia Hockey Union at info@namibiahockey.org or call +264 61 123 4567.'
    },
    {
      question: 'Where are most games played?',
      answer: 'Most hockey games take place at the National Hockey Stadium in Windhoek and at various club venues across the country.'
    },
    {
      question: 'How can I become a referee or umpire?',
      answer: 'We regularly conduct umpiring and refereeing courses. Check the Events tab for upcoming courses or contact our office for more information.'
    },
    {
      question: 'What equipment do I need to play?',
      answer: 'Basic equipment includes a hockey stick, appropriate footwear, shin guards, and a mouthguard. Some positions may require additional protective gear.'
    }
  ];

  // Suggested questions to display
  const [suggestedQuestions, setSuggestedQuestions] = useState(
    qaPairs.slice(0, 4).map(pair => pair.question)
  );

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: input
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    // Find a matching question or respond with default
    setTimeout(() => {
      const lowercaseInput = input.toLowerCase();
      const matchingPair = qaPairs.find(pair => 
        pair.question.toLowerCase().includes(lowercaseInput) || 
        lowercaseInput.includes(pair.question.toLowerCase().replace('how do i ', '').replace('how can i ', ''))
      );

      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: matchingPair 
          ? matchingPair.answer 
          : "I'm sorry, I don't have information about that. Please try asking something else or rephrase your question."
      };

      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Update suggested questions to be different from what was just asked
      const excludedQuestions = [input];
      const availableQuestions = qaPairs
        .map(pair => pair.question)
        .filter(q => !excludedQuestions.some(eq => q.toLowerCase().includes(eq.toLowerCase())));
      
      setSuggestedQuestions(
        availableQuestions.slice(0, 4)
      );
    }, 500);
  };

  const handleQuestionTap = (question) => {
    setInput(question);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: question
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Find matching answer
    setTimeout(() => {
      const matchingPair = qaPairs.find(pair => pair.question === question);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: matchingPair.answer
      };

      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Update suggested questions to be different
      const availableQuestions = qaPairs
        .map(pair => pair.question)
        .filter(q => q !== question);
      
      setSuggestedQuestions(
        availableQuestions.slice(0, 4)
      );
    }, 500);

    setInput('');
  };

  const renderMessageItem = ({ item }) => (
    <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
      {item.type === 'bot' && (
        <View style={styles.botAvatar}>
          <Ionicons name="help-circle" size={24} color={COLORS.background} />
        </View>
      )}
      <View style={item.type === 'user' ? styles.userMessage : styles.botMessage}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />
      
      {suggestedQuestions.length > 0 && (
        <View style={styles.suggestedQuestionsContainer}>
          <Text style={styles.suggestedHeader}>Suggested Questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestedQuestion}
                onPress={() => handleQuestionTap(question)}
              >
                <Text style={styles.suggestedQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={100}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your question here..."
          placeholderTextColor={COLORS.textLight}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            input.trim() === '' ? styles.sendButtonDisabled : {}
          ]}
          onPress={handleSend}
          disabled={input.trim() === ''}
        >
          <Ionicons name="send" size={24} color={input.trim() === '' ? COLORS.textLight : COLORS.background} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.medium,
    paddingBottom: SIZES.large,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.medium,
    paddingBottom: SIZES.extraLarge * 2,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SIZES.medium,
  },
  botMessageContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.small,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    ...SHADOWS.small,
  },
  botMessage: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    ...SHADOWS.small,
  },
  messageText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  suggestedQuestionsContainer: {
    padding: SIZES.medium,
    backgroundColor: COLORS.surfaceDark,
  },
  suggestedHeader: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SIZES.small,
  },
  suggestedQuestion: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 20,
    marginRight: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestedQuestionText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.medium,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    marginRight: SIZES.small,
    fontSize: SIZES.font,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  }
});

export default HelpScreen;
