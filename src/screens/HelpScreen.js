import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const { width } = Dimensions.get('window');

const HelpScreen = () => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      type: 'bot', 
      text: "Hello! 👋 I'm HockeyBot, your Namibia Hockey Union assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [suggestedQueries, setSuggestedQueries] = useState([
    "How do I register a team?",
    "When are upcoming tournaments?",
    "How do I edit player details?",
    "What equipment is needed?"
  ]);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef();

  // Scroll to the end when new messages are added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Database of predefined answers
  const knowledgeBase = {
    // Team related
    "register team": "To register a team, go to the Teams tab and tap the + button at the bottom right. Fill out the team details form including name, category, coach info, and other required fields.",
    "edit team": "You can edit a team by going to the Teams tab, selecting the team from the list, and tapping the Edit button on the team details page.",
    "transfer player": "To transfer a player to a different team, go to the Players tab, select the player, tap Edit, and choose a new team from the dropdown menu.",
    "team categories": "We offer several categories including Senior Men, Senior Women, Junior Men, Junior Women, Boys U18, Girls U18, Boys U16, Girls U16, Boys U14 and Girls U14.",
    "team uniforms": "Each team must have a primary and secondary uniform. Primary colors should match your club colors. Contact the Namibia Hockey Union for detailed uniform requirements and approval process.",
    "team fees": "Team registration fees are N$2500 for senior teams and N$1500 for junior teams per season. These fees must be paid before the team can participate in any official matches.",
    "minimum team size": "Teams must have a minimum of 11 registered players, with a maximum of 18 for tournament rosters. We recommend having at least 15 players registered to allow for substitutions and absences.",
    "team coach": "Each team must register at least one qualified coach. The coach certification requirements vary by team category. You can register a coach on the Team details page.",

    // Player related
    "register player": "To register a player, navigate to the Players tab and tap the + button. Fill in all required details including name, date of birth, contact info, and team assignment if applicable.",
    "edit player": "To edit player details, go to the Players screen, tap on the player's card, and then tap the Edit button on their profile page.",
    "player information": "Player profiles should include full name, date of birth, contact information, jersey number, position, and their team assignment if applicable.",
    "filter players": "On the Players screen, use the horizontal category filter at the top to view players by team category (e.g., Senior Men, Junior Women).",
    "player eligibility": "Players must be registered at least 48 hours before a match to be eligible to play. Age restrictions apply for youth categories - players must be under the specified age as of January 1st of the current year.",
    "player fees": "Player registration fees are N$350 for seniors and N$250 for juniors per season. These can be paid through the app using the payment link sent after initial registration.",
    "player transfer": "Players can transfer between teams once per season. There is a 14-day waiting period after a transfer request before a player becomes eligible to play for their new team.",
    "player positions": "Standard field hockey positions include Goalkeeper, Defenders (Full-back, Half-back), Midfielders (Center, Right, Left), and Forwards (Center Forward, Inside Forward, Wing).",

    // Event related
    "create event": "To create a new event, go to the Events tab and tap the + button. Fill in all event details including name, date, time, location, and description.",
    "upcoming tournaments": "You can view all upcoming tournaments in the Events tab. Use the 'Upcoming' filter to see only future events.",
    "event filters": "In the Events tab, use the filter tabs at the top to toggle between All, Upcoming, and Past events.",
    "cancel event": "To cancel or reschedule an event, open the event details page and tap the Edit button. You can update the date/time or delete the event entirely.",
    "tournament format": "Most tournaments follow a group stage followed by knockout rounds. The exact format depends on the number of teams participating and will be communicated before each tournament.",
    "registration deadline": "Team registration deadlines are typically 2 weeks before the tournament date. Late registrations may be accepted with an additional fee, subject to availability.",
    "match schedule": "Match schedules are typically published 7 days before the tournament. You can find the schedule in the Events section or download it from our website.",
    "tournament rules": "Each tournament has its specific rules which will be shared with registered teams. General rules follow the International Hockey Federation (FIH) guidelines with local modifications.",

    // Equipment
    "equipment": "Basic hockey equipment includes a hockey stick, appropriate footwear (turf shoes), shin guards, mouthguard, and a glove for your left hand. Goalkeepers require additional protective gear including helmet, chest guard, leg guards, and kickers.",
    "stick regulations": "Sticks must comply with FIH regulations. The stick must pass through a 51mm ring and cannot have any sharp edges. Carbon fiber, fiberglass, and wooden sticks are all permitted.",
    "goalie equipment": "Goalkeepers must wear a helmet with full face protection, chest protector, leg guards, kickers, hand protectors, and an abdominal protector. All equipment must meet safety standards.",
    "mouthguards": "Mouthguards are mandatory for all players during official matches and recommended during training. Custom-fitted mouthguards provide better protection than standard ones.",
    
    // Rules and regulations
    "game duration": "Standard matches consist of four quarters of 15 minutes each, with a 2-minute break between quarters 1-2 and 3-4, and a 10-minute halftime break between quarters 2-3.",
    "substitutions": "Teams can make unlimited substitutions at any time during the game, except during penalty corners. Substitutions must be made at the halfway line.",
    "cards system": "Hockey uses a card system for disciplinary actions: green card (2-minute suspension), yellow card (5-10 minute suspension), and red card (ejection from game).",
    "scoring": "Teams score by hitting the ball into the opponent's goal from within the shooting circle. A goal is only valid if the ball is touched by an attacker inside the circle.",
    
    // Training information
    "training venues": "The main training venues are the National Hockey Stadium in Windhoek, Swakopmund Hockey Club, and Walvis Bay Sports Complex. Check the app for booking information.",
    "coaching courses": "The Namibia Hockey Union offers coaching courses throughout the year. Information about upcoming courses can be found in the Events section of the app.",
    "youth development": "Our youth development program runs on Saturday mornings at the National Hockey Stadium. Children aged 6-14 are welcome to join at any time during the season.",
    "fitness requirements": "We recommend players maintain a good level of cardiovascular fitness, with an emphasis on sprint ability, agility, and core strength. Contact your team coach for specific training programs.",
    
    // Facilities
    "hockey fields": "Namibia has 3 artificial turf fields (2 in Windhoek, 1 in Swakopmund) and several grass fields across the country. Check the app for locations and availability.",
    "field booking": "To book a field for training or friendly matches, use the 'Book Facility' feature on the home screen or contact the facility manager directly through the app.",
    "changing facilities": "All official hockey venues have changing rooms and showers. Some facilities may require a small fee for access to these amenities.",
    "spectator areas": "The National Hockey Stadium has covered seating for 500 spectators. Other venues have limited seating, and spectators are advised to bring portable chairs for comfort.",
    
    // App usage
    "offline use": "Yes, you can use the app offline! Basic functionality works without internet. Your data will sync automatically when you reconnect.",
    "search": "Each main section (Teams, Players, Events) has a search bar at the top that allows you to search by name or other relevant details.",
    "navigate": "Use the tab bar at the bottom of the screen to switch between Home, Teams, Players, Events, and Help sections.",
    "app updates": "The app is updated monthly with new features and bug fixes. Make sure to keep your app updated to access all features and security improvements.",
    "data privacy": "Your personal information is stored securely and only shared with Namibia Hockey Union officials as needed for administration. We never share your data with third parties.",
    "notifications": "To manage notification settings, go to your profile page and select 'Notification Preferences'. You can opt in or out of different types of notifications.",
    
    // Membership
    "membership benefits": "Membership includes access to all Namibia Hockey Union facilities, discounted tournament entry fees, insurance coverage during official games, and voting rights at the AGM.",
    "membership renewal": "Memberships run from January to December and must be renewed annually. Renewal notifications will be sent through the app in November each year.",
    "family discount": "Families with 3 or more registered players receive a 15% discount on membership fees. Apply for this discount through the 'Family Membership' section in the app.",
    
    // Contact
    "contact": "For technical support, please email support@namibiahockey.org or call our help desk at +264 61 234 5678. For general inquiries, contact info@namibiahockey.org.",
    "report issue": "To report incorrect information or app issues, please email support@namibiahockey.org with details about the problem you're experiencing.",
    "website": "Visit our official website at www.namibiahockey.org for more information, news, events, and resources.",
    "social media": "Follow us on Facebook, Instagram, and Twitter @NamibiaHockey for the latest news, match results, and announcements.",
    "office hours": "The Namibia Hockey Union office is open Monday to Friday, 8:30 AM to 4:30 PM. The office is located at the National Hockey Stadium in Windhoek.",
    
    // Default responses
    "default": "I'm not sure I understand that question. Could you try rephrasing or select one of the suggested queries?",
    "greeting": "Hello! How can I assist you with the Namibia Hockey Union app today?",
    "thanks": "You're welcome! Is there anything else I can help you with?",
    "goodbye": "Thank you for using HockeyBot! Feel free to return anytime you have questions about the Namibia Hockey Union app."
  };

  // More comprehensive suggestions based on categories
  const allSuggestions = {
    teams: [
      "How do I register a team?",
      "How do I edit team information?",
      "What team categories are available?",
      "How do I add players to my team?",
      "What are the team registration fees?",
      "What are the uniform requirements?",
      "What's the minimum team size?",
      "Do teams need a qualified coach?"
    ],
    players: [
      "How do I register a new player?",
      "How do I edit player details?",
      "What player information should I include?",
      "How do I filter players by category?",
      "What are the player eligibility rules?",
      "How much are player registration fees?",
      "How do player transfers work?",
      "What positions exist in hockey?"
    ],
    events: [
      "How do I create a new event?",
      "When are upcoming tournaments?",
      "How do I filter events?",
      "How do I cancel or reschedule an event?",
      "What tournament formats are used?",
      "When are registration deadlines?",
      "How do I find the match schedule?",
      "Where can I find tournament rules?"
    ],
    equipment: [
      "What equipment do I need?",
      "What are the stick regulations?",
      "What equipment do goalies need?",
      "Are mouthguards required?"
    ],
    rules: [
      "How long is a hockey game?",
      "How do substitutions work?",
      "What is the card system?",
      "How does scoring work in hockey?"
    ],
    training: [
      "Where are training venues located?",
      "Are there coaching courses available?",
      "Is there a youth development program?",
      "What fitness is required for hockey?"
    ],
    facilities: [
      "What hockey fields are available?",
      "How do I book a field?",
      "Are there changing facilities?",
      "What spectator areas are available?"
    ],
    help: [
      "Can I use the app offline?",
      "How do I search in the app?",
      "How do I get app updates?",
      "How is my data protected?",
      "How do I manage notifications?",
      "How do I contact support?",
      "How do I report an issue?"
    ],
    membership: [
      "What are membership benefits?",
      "When do I renew my membership?",
      "Is there a family discount available?",
      "How do I update my membership details?"
    ]
  };

  // Find an answer to user query
  const getAnswer = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check for greetings
    if (/\b(hi|hello|hey|greetings)\b/.test(lowerQuery)) {
      return knowledgeBase["greeting"];
    }
    
    // Check for thank you
    if (/\b(thank|thanks)\b/.test(lowerQuery)) {
      return knowledgeBase["thanks"];
    }
    
    // Check for goodbye
    if (/\b(bye|goodbye|see you)\b/.test(lowerQuery)) {
      return knowledgeBase["goodbye"];
    }
    
    // Look for keyword matches
    for (const [keyword, answer] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(keyword)) {
        return answer;
      }
    }
    
    // If no match found, return default response
    return knowledgeBase["default"];
  };

  // Generate relevant suggested queries based on latest conversation
  const updateSuggestions = (lastQuery) => {
    let lastQueryLower = lastQuery?.toLowerCase() || '';
    let newSuggestions = [];
    
    if (lastQueryLower.includes('team')) {
      newSuggestions = allSuggestions.teams;
    } else if (lastQueryLower.includes('player')) {
      newSuggestions = allSuggestions.players;
    } else if (lastQueryLower.includes('event') || lastQueryLower.includes('tournament')) {
      newSuggestions = allSuggestions.events;
    } else {
      // Mix suggestions from different categories
      newSuggestions = [
        allSuggestions.teams[Math.floor(Math.random() * allSuggestions.teams.length)],
        allSuggestions.players[Math.floor(Math.random() * allSuggestions.players.length)],
        allSuggestions.events[Math.floor(Math.random() * allSuggestions.events.length)],
        allSuggestions.equipment[Math.floor(Math.random() * allSuggestions.equipment.length)],
        allSuggestions.rules[Math.floor(Math.random() * allSuggestions.rules.length)],
        allSuggestions.training[Math.floor(Math.random() * allSuggestions.training.length)],
        allSuggestions.facilities[Math.floor(Math.random() * allSuggestions.facilities.length)],
        allSuggestions.help[Math.floor(Math.random() * allSuggestions.help.length)],
        allSuggestions.membership[Math.floor(Math.random() * allSuggestions.membership.length)]
      ];
    }
    
    setSuggestedQueries(newSuggestions);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setTyping(true);
    
    // Simulate bot thinking and typing
    setTimeout(() => {
      const answer = getAnswer(userMessage.text);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: answer,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setTyping(false);
      updateSuggestions(userMessage.text);
    }, 1000); // simulate a brief delay for "typing"
  };

  const handleSuggestionPress = (suggestion) => {
    setInputText(suggestion);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: suggestion,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setTyping(true);
    
    // Simulate bot thinking and typing
    setTimeout(() => {
      const answer = getAnswer(suggestion);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: answer,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setTyping(false);
      updateSuggestions(suggestion);
    }, 1000);
    
    setInputText('');
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    if (item.type === 'bot') {
      return (
        <View style={styles.botMessageContainer}>
          <View style={styles.botAvatarContainer}>
            <View style={styles.botAvatar}>
              <Ionicons name="help-circle" size={18} color={COLORS.background} />
            </View>
          </View>
          <View style={styles.botMessageContent}>
            <Text style={styles.botMessage}>{item.text}</Text>
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageContent}>
            <Text style={styles.userMessage}>{item.text}</Text>
            <Text style={styles.messageTimeUser}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      );
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        id: '1', 
        type: 'bot', 
        text: "Hello again! 👋 I'm HockeyBot. How can I help you today?",
        timestamp: new Date()
      }
    ]);
    setSuggestedQueries([
      "How do I register a team?",
      "When are upcoming tournaments?",
      "How do I edit player details?",
      "What equipment is needed?"
    ]);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/adaptive-icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>HockeyBot</Text>
            <Text style={styles.headerSubtitle}>Namibia Hockey Union Assistant</Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Ionicons name="refresh" size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Bot is typing indicator */}
      {typing && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMiddle]} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>HockeyBot is typing...</Text>
        </View>
      )}
      
      {/* Suggested Queries */}
      <View style={styles.suggestedContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedContent}
        >
          {suggestedQueries.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me something..."
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() === '' ? styles.sendButtonDisabled : {}
          ]}
          onPress={handleSendMessage}
          disabled={inputText.trim() === ''}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() === '' ? COLORS.textLight : COLORS.background} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: SIZES.medium,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.background,
    opacity: 0.8,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: SIZES.medium,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: SIZES.medium,
    paddingBottom: SIZES.extraLarge,
  },
  botMessageContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
    maxWidth: '90%',
  },
  botAvatarContainer: {
    marginRight: SIZES.small,
    alignSelf: 'flex-end',
    marginBottom: SIZES.small,
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botMessageContent: {
    maxWidth: '85%',
  },
  botMessage: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    padding: SIZES.medium,
    ...SHADOWS.small,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.medium,
    maxWidth: '90%',
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    padding: SIZES.medium,
    ...SHADOWS.small,
    fontSize: SIZES.font,
    color: COLORS.surface,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    marginLeft: SIZES.small,
  },
  messageTimeUser: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    marginRight: SIZES.small,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.small + 34, // account for avatar width + margin
    marginBottom: SIZES.medium,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    paddingHorizontal: SIZES.small,
    paddingVertical: 6,
    alignItems: 'center',
    marginRight: SIZES.small,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  suggestedContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  suggestedContent: {
    paddingHorizontal: SIZES.medium,
    gap: SIZES.small,
  },
  suggestionButton: {
    backgroundColor: COLORS.yellowLight,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 18,
    marginRight: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  suggestionText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: SIZES.medium,
    paddingVertical: Platform.OS === 'ios' ? SIZES.small : SIZES.small / 2,
    fontSize: SIZES.font,
    color: COLORS.text,
    maxHeight: 100,
    minHeight: 46,
    ...SHADOWS.small,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.small,
    ...SHADOWS.small,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceDark,
  }
});

export default HelpScreen; 